import abc
from dataclasses import dataclass
from enum import IntFlag, STRICT
import logging
from typing import Optional

from api.models import MapGenerationIntermediateResult, RasterMapGenerationRequest, User
from api.services.map_tile_generator.tile_definitions import Tileset
from api.services.map_tile_generator.tile_source import TileSource


@dataclass
class TileCacheStatistics:
    total_tiles: int = 0
    cache_hits: int = 0
    cache_misses: int = 0
    errors: int = 0


@dataclass
class TileRetrieveResult:
    hit: bool
    data: bytes


class DownloadProgressReporter(abc.ABC):
    def report_progress(
        self, tiles_loaded: int, total_tiles: int, stats: TileCacheStatistics
    ):
        pass


class LoggingDownloadProgressReporter(DownloadProgressReporter):
    def report_progress(
        self, tiles_loaded: int, total_tiles: int, stats: TileCacheStatistics
    ):
        logging.info(
            f"{tiles_loaded} / {total_tiles} ({round((tiles_loaded/total_tiles) * 100.0, 2)}%)"
        )


class GenerationRequestProgressReporter(DownloadProgressReporter):
    def __init__(self, mgr: RasterMapGenerationRequest):
        self.mgr = mgr

    def report_progress(
        self, tiles_loaded: int, total_tiles: int, stats: TileCacheStatistics
    ):
        logging.info(
            f"{tiles_loaded} / {total_tiles} ({round((tiles_loaded/total_tiles) * 100.0, 2)}%)"
        )

        progress, _ = MapGenerationIntermediateResult.objects.get_or_create(
            generation_request=self.mgr
        )
        progress.cache_hits = stats.cache_hits
        progress.cache_misses = stats.cache_misses
        progress.tiles_downloaded = tiles_loaded
        progress.remaining_tiles = total_tiles - tiles_loaded
        progress.save()


class CacheAccessMode(IntFlag, boundary=STRICT):
    DISABLE_READS = 1
    DISABLE_L1_WRITES = 2
    DISABLE_L2_WRITES = 4


# @dataclass
# class ProtomapGenerationParameters:
#     tileset_name: str
#     tileset: Tileset
#     source: TileSource
#     owner: Optional[User] = None
#     cache_mode: CacheAccessMode = CacheAccessMode(0)
#     download_reporter: DownloadProgressReporter = LoggingDownloadProgressReporter()


@dataclass
class ProtomapGenerationParameters:
    map_generation_request_id: int
    cache_mode: CacheAccessMode = CacheAccessMode(0)
