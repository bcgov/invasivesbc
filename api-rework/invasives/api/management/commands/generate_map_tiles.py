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
            "--max_zoom",
            help="Max zoom level to include",
            type=int,
            default=10,
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

        stats = TileDownloader.generate_map_tiles(
            tiles=NTSGridTileDefinition(zoom_range=range(0, options["max_zoom"])),
            source=ESRIWorldImageryTileSource(),
            stop_event=self.stop_event,
        )

        logging.info(pformat(stats))
