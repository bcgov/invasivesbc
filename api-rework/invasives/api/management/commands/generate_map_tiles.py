import logging
import signal
import threading
from pprint import pformat

from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import MapGenerationRecord, RasterMapGenerationRequest
from api.services.map_tile_generator.definitions import (
    CacheAccessMode,
    ProtomapGenerationParameters,
)
from api.services.map_tile_generator.tile_definitions import NTSGridTileDefinition
from api.services.map_tile_generator.tile_downloader import TileDownloader
from api.services.map_tile_generator.tile_source import ESRIWorldImageryTileSource
from invasivesbc.settings import SCRATCH_DIRECTORY, TILE_CACHE_MAXIMUM_SIZE
from api.tasks import process_download_request, dispatch_map_generation_request
from django.contrib.gis.geos import Polygon


class Command(BaseCommand):
    help = "Simulate or perform a migration of legacy activities"

    def __init__(self):
        super().__init__()
        self.stop_event = threading.Event()

    def add_arguments(self, parser):
        parser.add_argument(
            "--min_zoom",
            help="Min zoom level to include",
            type=int,
            default=0,
        )
        parser.add_argument(
            "--max_zoom",
            help="Max zoom level to include",
            type=int,
            default=10,
        )
        parser.add_argument(
            "--disable-cache-reads",
            help="Don't read tiles from cache (always download)",
            action="store_true",
        )
        parser.add_argument(
            "--disable-l1-writes",
            help="Don't write tiles to the local tile cache",
            action="store_true",
        )
        parser.add_argument(
            "--disable-l2-writes",
            help="Don't write tiles to the database tile cache",
            action="store_true",
        )
        parser.add_argument(
            "--async",
            help="Operate asynchronously (if unset, dispatch actual generation requests to celery tasks for background execution)",
            action="store_true",
        )

    def handle(self, *args, **options):
        logging.info(f"output to {SCRATCH_DIRECTORY}")
        logging.info(
            f"max local cache size {TILE_CACHE_MAXIMUM_SIZE} ({round(TILE_CACHE_MAXIMUM_SIZE/(1024*1024), 0)}MB)"
        )

        def handle_interruption(sig, frame):
            if not self.stop_event.is_set():
                logging.info(
                    "Interrupted. Requesting graceful shutdown. Another interrupt will terminate immediately."
                )
                self.stop_event.set()
            else:
                logging.info("Terminating on signal")
                exit(-2)

        signal.signal(signal.SIGINT, handle_interruption)

        cache_mode = CacheAccessMode(0)
        if options["disable_cache_reads"]:
            cache_mode |= CacheAccessMode.DISABLE_READS
        if options["disable_l1_writes"]:
            cache_mode |= CacheAccessMode.DISABLE_L1_WRITES
        if options["disable_l2_writes"]:
            cache_mode |= CacheAccessMode.DISABLE_L2_WRITES

        logging.warning(f"Using cache mode {str(cache_mode)} for this run")

        for ts in NTSGridTileDefinition(
            min_zoom=options["min_zoom"], max_zoom=options["max_zoom"]
        ).tilesets():
            mgr, _ = RasterMapGenerationRequest.objects.update_or_create(
                file_name=ts.name,
                owner=None,
                defaults={
                    "status": "PENDING",
                    "minimum_zoom": ts.min_zoom,
                    "maximum_zoom": ts.max_zoom,
                    "bounds": Polygon(
                        (
                            (ts.bounds.left, ts.bounds.top),
                            (ts.bounds.right, ts.bounds.top),
                            (ts.bounds.right, ts.bounds.bottom),
                            (ts.bounds.left, ts.bounds.bottom),
                            (ts.bounds.left, ts.bounds.top),
                        )
                    ),
                    "tile_definition_source_name": "esri-world-imagery",
                },
            )
            mgr.save()

            generation_options: ProtomapGenerationParameters = (
                ProtomapGenerationParameters(
                    map_generation_request_id=mgr.id,
                    cache_mode=cache_mode,
                )
            )

            if options["async"]:
                # ask celery to do it later
                transaction.on_commit(
                    lambda: dispatch_map_generation_request(
                        generation_options, priority=1  # low priority
                    )
                )
            else:
                # call synchronously, now, in this thread
                process_download_request.s(generation_options).apply()
