from datetime import timedelta
import logging
import signal
from typing import Set

from django.core.management.base import BaseCommand
import mercantile

from api.services.map_tile_generator.tile_definitions import NTSGridTileDefinition
from api.models.map_generation.map_generation_request import (
    AVERAGE_SIZE_OF_TILE,
    TILES_PER_SECOND_WORST_CASE,
    TILES_PER_SECOND_BEST_CASE,
)


def count_suffix(size):
    for unit in ["", "K", "M", "B", "T"]:
        if size < 1000.0 or unit == "T":
            break
        size /= 1000.0
    return f"{size:.{0}f}{unit}"


def size_suffix(size):
    for unit in ["B", "KiB", "MiB", "GiB", "TiB"]:
        if size < 1024.0 or unit == "TiB":
            break
        size /= 1024.0
    return f"{size:.{1}f} {unit}"


class Command(BaseCommand):
    help = "Estimate data set size for NTS grids (for pre-caching tiles). Deduplicates tile lists (slow, but accurate)."

    def __init__(self):
        super().__init__()
        self.shutdown = False

    def add_arguments(self, parser):
        parser.add_argument(
            "--max_zoom",
            help="Max zoom level to estimate",
            type=int,
            default=19,
        )

        pass

    def handle(self, *args, **options):

        def handle_interruption(sig, frame):
            if not self.shutdown:
                logging.info(
                    "Interrupted. Requesting graceful shutdown. Another interrupt will terminate immediately."
                )
                self.shutdown = True
            else:
                logging.info("Terminating on signal")
                exit(-2)

        signal.signal(signal.SIGINT, handle_interruption)

        tiles_at_previous_zoom_level = 0

        for z in range(0, options["max_zoom"] + 1):
            tilesets = NTSGridTileDefinition(min_zoom=0, max_zoom=z).tilesets()

            unique_tiles: Set[mercantile.Tile] = set()

            for tileset in tilesets:
                for tile in list(tileset.tiles):
                    if tile not in unique_tiles and not self.shutdown:
                        unique_tiles.add(tile)

            if self.shutdown:
                logging.info("Shutdown due to signal")
                break

            tiles_at_zoom_level = len(unique_tiles)

            logging.info(
                f"zoom={z:2}\t"
                f"tile_count={count_suffix(tiles_at_zoom_level)}\t"
                f"zoom_set_size={size_suffix(tiles_at_zoom_level * AVERAGE_SIZE_OF_TILE)}\t"
                f"download_time_worst_case={timedelta(seconds=(tiles_at_zoom_level-tiles_at_previous_zoom_level) / TILES_PER_SECOND_WORST_CASE)}\t"
                f"download_time_best_case={timedelta(seconds=(tiles_at_zoom_level-tiles_at_previous_zoom_level) / TILES_PER_SECOND_BEST_CASE)}\t"
            )

            tiles_at_previous_zoom_level = tiles_at_zoom_level
