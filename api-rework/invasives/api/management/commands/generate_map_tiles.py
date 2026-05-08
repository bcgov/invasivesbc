import logging
import signal
import threading
from pprint import pformat

from django.core.management.base import BaseCommand

from api.services.map_tile_generator.tile_definitions import NTSGridTileDefinition
from api.services.map_tile_generator.tile_downloader import TileDownloader
from api.services.map_tile_generator.tile_source import ESRIWorldImageryTileSource
from invasivesbc.settings import SCRATCH_DIRECTORY, TILE_CACHE_MAXIMUM_SIZE


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

        cache_mode = TileDownloader.CacheAccessMode(0)
        if options["disable_cache_reads"]:
            cache_mode |= TileDownloader.CacheAccessMode.DISABLE_READS
        if options["disable_l1_writes"]:
            cache_mode |= TileDownloader.CacheAccessMode.DISABLE_L1_WRITES
        if options["disable_l2_writes"]:
            cache_mode |= TileDownloader.CacheAccessMode.DISABLE_L2_WRITES

        logging.warning(f"Using cache mode {str(cache_mode)} for this run")

        stats = TileDownloader.generate_map_tiles(
            tiles=NTSGridTileDefinition(
                min_zoom=options["min_zoom"], max_zoom=options["max_zoom"]
            ),
            source=ESRIWorldImageryTileSource(),
            stop_event=self.stop_event,
            cache_mode=cache_mode,
        )

        logging.info(pformat(stats))
