import logging
import signal
from collections import deque
from dataclasses import dataclass
from functools import reduce
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand

from api.services.map_tile_generator.tile_definitions import NTSGridTileDefinition
from api.services.map_tile_generator.tile_downloader import (
    TileDownloader,
    TileCacheStatistics,
)
from api.services.map_tile_generator.tile_source import ESRIWorldImageryTileSource


class Command(BaseCommand):
    help = "Download world imagery map tiles for NTS map 50k sheets into cache (but don't export any pmtiles)"

    def __init__(self):
        super().__init__()
        self.shutdown = False

    def add_arguments(self, parser):
        parser.add_argument(
            "--max_zoom",
            help="Max zoom level to pre-cache",
            type=int,
            default=10,
        )

        parser.add_argument(
            "--max_downloads",
            help="Download at most this many tiles and then exit",
            type=int,
            default=0,
        )

        pass

    def handle(self, *args, **options):
        shutdown = False

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

        tile_definitions = NTSGridTileDefinition(
            zoom_range=range(0, options["max_zoom"])
        ).tilesets()

        total_tile_count = reduce(
            lambda a, b: a + b, map(lambda t: len(t.tiles), tile_definitions), 0
        )
        job_start = datetime.now()

        overall_stats = TileCacheStatistics()

        logging.info(
            f"Preheating NTS grid tile cache, max zoom {options["max_zoom"]}, {len(tile_definitions)} map sheets ({total_tile_count} tiles)"
        )

        source = ESRIWorldImageryTileSource()

        @dataclass
        class TimeEstimateHelper:
            seconds: float
            stats: TileCacheStatistics

        estimates = deque()
        SHEETS_FOR_ESTIMATE = 5

        for i, t in enumerate(tile_definitions, start=1):

            if self.shutdown:
                logging.info("Shutdown due to signal")
                break

            if options["max_downloads"] <= 0:
                max_downloads_remaining = None  # unrestricted
            else:
                max_downloads_remaining = max(
                    options["max_downloads"] - overall_stats.cache_misses, 0
                )
                if max_downloads_remaining == 0:
                    logging.info(f"Max download count reached, stopping run.")
                    break
                else:
                    logging.info(
                        f"This run will stop after at most {max_downloads_remaining} more downloads"
                    )

            start = datetime.now()
            stats = TileDownloader.preheat_cache(
                t.tiles, source, max_downloads=max_downloads_remaining
            )
            sheet_time = datetime.now() - start

            estimates.append(
                TimeEstimateHelper(seconds=sheet_time.total_seconds(), stats=stats)
            )

            # only track the last few sheets to get a better estimate, since hit ratio and connection speed are variable
            while len(estimates) > SHEETS_FOR_ESTIMATE:
                estimates.popleft()

            recent_tile_count = reduce(
                lambda a, b: a + b, map(lambda t: t.stats.total_tiles, estimates), 0
            )
            recent_elapsed = reduce(
                lambda a, b: a + b,
                map(lambda t: t.seconds, estimates),
                0,
            )
            recent_tps = recent_tile_count / recent_elapsed

            overall_stats.total_tiles += stats.total_tiles
            overall_stats.errors += stats.errors
            overall_stats.cache_misses += stats.cache_misses
            overall_stats.cache_hits += stats.cache_hits

            tiles_remaining = total_tile_count - stats.total_tiles

            estimate_remaining = timedelta(seconds=round(tiles_remaining / recent_tps))

            sheet_tps = stats.total_tiles / sheet_time.total_seconds()

            logging.info(
                f"sheet {i}/{len(tile_definitions)} - {t.name}"
                f" {stats.cache_hits}/{stats.total_tiles} hit, {stats.cache_misses} missed, {stats.errors} errors,"
                f" {round(sheet_time.total_seconds(), 0)}s {round(sheet_tps, 1)} tiles/sec - estimate {str(estimate_remaining)} ({tiles_remaining} tiles) remaining"
            )

        logging.info(
            f"run complete"
            f" {overall_stats.cache_hits}/{overall_stats.total_tiles} hit,"
            f" {overall_stats.cache_misses} missed (downloaded),"
            f" {overall_stats.errors} errors,"
            f" {str(datetime.now() - job_start)} elapsed"
        )
