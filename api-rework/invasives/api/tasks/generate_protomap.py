import logging
from collections import deque
from dataclasses import dataclass
from datetime import timedelta, datetime
from functools import reduce

from api.models import RasterMapGenerationRequest
from api.services.map_tile_generator.definitions import (
    ProtomapGenerationParameters,
    TileCacheStatistics,
)
from api.services.map_tile_generator.tile_definitions import NTSGridTileDefinition
from api.services.map_tile_generator.tile_source import ESRIWorldImageryTileSource
from invasivesbc import celery_app
from invasivesbc.settings import SCRATCH_DIRECTORY, TILE_CACHE_MAXIMUM_SIZE


def dispatch_map_generation_request(
    parameters: ProtomapGenerationParameters, priority=6
) -> None:
    # For use in post-commit hooks, mostly. queues it for execution and saves the celery task ID in the object

    result = process_download_request.apply_async(
        args=[parameters],
        priority=priority,
    )

    RasterMapGenerationRequest.objects.filter(
        id=parameters.map_generation_request_id
    ).update(
        celery_task_id=result.id
    )  # save the id of the celery task so we can look it up later


@celery_app.task(acks_late=True, bind=True, track_started=True)
def process_download_request(self, options: ProtomapGenerationParameters):
    # wrap this call in a task so we can optionally call it asynchronously
    from api.services.map_tile_generator.tile_downloader import TileDownloader

    TileDownloader.generate_protomap_archive(options)


@celery_app.task
def preheat_map_cache(max_zoom=15):
    logging.info(f"output to {SCRATCH_DIRECTORY}")
    logging.info(
        f"max cache size {TILE_CACHE_MAXIMUM_SIZE} ({round(TILE_CACHE_MAXIMUM_SIZE/(1024*1024), 0)}MB)"
    )
    from api.services.map_tile_generator.tile_downloader import TileDownloader

    tile_definitions = NTSGridTileDefinition(min_zoom=0, max_zoom=max_zoom).tilesets()

    total_tile_count = reduce(
        lambda a, b: a + b, map(lambda t: len(t.tiles), tile_definitions), 0
    )
    job_start = datetime.now()

    overall_stats = TileCacheStatistics()

    logging.info(
        f"Preheating NTS grid tile cache, max zoom {max_zoom}, {len(tile_definitions)} map sheets ({total_tile_count} tiles)"
    )

    source = ESRIWorldImageryTileSource()

    @dataclass
    class TimeEstimateHelper:
        seconds: float
        stats: TileCacheStatistics

    estimates = deque()
    SHEETS_FOR_ESTIMATE = 5

    for i, t in enumerate(tile_definitions, start=1):

        start = datetime.now()

        stats = TileDownloader.preheat_cache(t.tiles, source)
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

        tiles_remaining = total_tile_count - overall_stats.total_tiles

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
