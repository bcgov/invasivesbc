import abc
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
import os
import subprocess
from typing import List, Optional

import boto3
from botocore.exceptions import ClientError
import diskcache
from diskcache import Cache
from django.db import transaction
from django.utils import timezone
import mercantile
import requests
from requests import RequestException

from api.models import CachedRasterTile, RasterMapGenerationRequest
from api.services.map_tile_generator.mb_tiles_database import MBTilesDatabase
from api.services.map_tile_generator.tile_definitions import (
    TileDefinition,
)
from api.services.map_tile_generator.tile_source import (
    TileSource,
)
from invasivesbc.settings import (
    OBJECT_STORE_ACCESS_KEY_ID,
    OBJECT_STORE_ENDPOINT_URL,
    OBJECT_STORE_MAP_UPLOAD_BUCKET,
    OBJECT_STORE_SECRET_ACCESS_KEY,
    SCRATCH_DIRECTORY,
    TILE_CACHE_MAXIMUM_SIZE,
)

# store frequently-used low-zoom tiles locally for faster retrieval
LOCAL_CACHE_ZOOM_RANGE = range(0, 11)
# store more tiles in the database for shared access (across workers)
DATABASE_CACHE_ZOOM_RANGE = range(0, 20)

cache = Cache(
    directory=os.path.join(SCRATCH_DIRECTORY, ".tile-cache"),
    size_limit=TILE_CACHE_MAXIMUM_SIZE,
)


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


class TileRetrieveException(Exception):
    pass


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
        with transaction.atomic():
            self.mgr.cache_hits = stats.cache_hits
            self.mgr.tiles_downloaded = tiles_loaded
            self.mgr.save()


class TileDownloader:
    def __init__(self):
        pass

    @staticmethod
    def retrieve_tile(
        source: TileSource,
        tile: mercantile.Tile,
    ) -> TileRetrieveResult:
        """
        Retrieve a tile from the source, employing caching mechanisms

        :param source: tile source definition
        :param tile: coordinates of tile to retrieve
        :return: TileRetrieveResult
        :raises: TileRetrieveException on retrieval failure
        """

        cache_key = f"{source.cache_area}-{tile.z}-{tile.x}-{tile.y}"

        # first we try the (local) disk cache
        if tile.z in LOCAL_CACHE_ZOOM_RANGE:
            cached = cache.get(cache_key, default=None)
            if cached is not None:
                return TileRetrieveResult(hit=True, data=cached)

        # now try the database cache
        if tile.z in DATABASE_CACHE_ZOOM_RANGE:
            cached = CachedRasterTile.objects.filter(key=cache_key).first()
            if cached is not None:
                return TileRetrieveResult(hit=True, data=cached.data)

        url = source.build_url(tile.z, tile.y, tile.x)

        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()  # raise an exception on HTTP error code

            # add to local cache
            if tile.z in LOCAL_CACHE_ZOOM_RANGE:
                cache.set(
                    cache_key,
                    response.content,
                    expire=source.cache_lifetime_seconds,
                )

            # add to database cache
            if tile.z in DATABASE_CACHE_ZOOM_RANGE:
                CachedRasterTile.objects.create(
                    key=cache_key,
                    data=response.content,
                    expires=timezone.now()
                    + timedelta(seconds=source.cache_lifetime_seconds),
                )

            return TileRetrieveResult(hit=False, data=response.content)
        except RequestException as e:
            logging.warning(f"tile download failure: {url}", exc_info=True)
            raise TileRetrieveException(e)
        except diskcache.Timeout as e:
            logging.error("cache timeout")
            raise TileRetrieveException(e)

    @staticmethod
    def preheat_cache(
        tiles: List[mercantile.Tile],
        source: TileSource,
        max_downloads: Optional[int] = None,
    ):
        stats = TileCacheStatistics()

        for tile in tiles:
            stats.total_tiles += 1

            if max_downloads is not None and stats.cache_misses >= max_downloads:
                logging.info(
                    "max hit count reached, terminating run"
                )  # this mechanism is intended to limit the runtime of the preheat function, for use in periodic tasks keeping the cache fresh
                return stats

            try:
                result = TileDownloader.retrieve_tile(source, tile)

                if result.hit:
                    stats.cache_hits += 1
                else:
                    stats.cache_misses += 1

            except TileRetrieveException as e:
                logging.warning(f"tile retrieve failure: {e}", exc_info=True)
                stats.errors += 1

        return stats

    @staticmethod
    def generate_protomap_archive(
        tileset_name: str,
        tiles: List[mercantile.Tile],
        source: TileSource,
        progress_reporter: DownloadProgressReporter = LoggingDownloadProgressReporter(),
    ):
        mbtiles_filename = os.path.join(
            SCRATCH_DIRECTORY, f"output/{tileset_name}.mbtiles"
        )
        pmtiles_filename = os.path.join(
            SCRATCH_DIRECTORY, f"output/{tileset_name}.pmtiles"
        )

        os.makedirs(os.path.join(SCRATCH_DIRECTORY, "output"), exist_ok=True)

        with MBTilesDatabase(
            mbtiles_filename, tileset_name, source.tile_format
        ) as tiledb:
            stats = TileCacheStatistics()

            tiles_loaded = 0
            last_report = datetime.now()

            for tile in tiles:

                try:
                    stats.total_tiles += 1
                    result = TileDownloader.retrieve_tile(source, tile)

                    if result.hit:
                        stats.cache_hits += 1
                    else:
                        stats.cache_misses += 1

                    tiledb.db.execute(
                        "INSERT OR REPLACE INTO tiles (zoom_level, tile_column, tile_row, tile_data) values (?, ?, ?, ?)",
                        (tile.z, (2**tile.z) - 1 - tile.y, tile.x, result.data),
                    )

                except TileRetrieveException as e:
                    logging.warning(f"tile retrieve failure: {e}", exc_info=True)
                    stats.errors += 1

                tiles_loaded += 1

                if datetime.now() - last_report > timedelta(seconds=10):
                    last_report = datetime.now()
                    progress_reporter.report_progress(
                        tiles_loaded=tiles_loaded, total_tiles=len(tiles), stats=stats
                    )

        subprocess.run(["pmtiles", "convert", mbtiles_filename, pmtiles_filename])

        s3_client = boto3.client(
            "s3",
            endpoint_url=OBJECT_STORE_ENDPOINT_URL,
            aws_access_key_id=OBJECT_STORE_ACCESS_KEY_ID,
            aws_secret_access_key=OBJECT_STORE_SECRET_ACCESS_KEY,
            aws_session_token=None,
            config=boto3.session.Config(
                signature_version="s3v4",
                request_checksum_calculation="when_required",
                response_checksum_validation="when_required",
            ),
        )
        try:
            s3_client.upload_file(
                pmtiles_filename,
                OBJECT_STORE_MAP_UPLOAD_BUCKET,
                f"maps/{tileset_name}.pmtiles",
                ExtraArgs={"ACL": "public-read"},
            )
            logging.info(f"PMTiles upload complete for {pmtiles_filename}")
        except ClientError as e:
            logging.error("Unable to upload file to object store", exc_info=True)
            raise e

        finally:
            if os.path.exists(mbtiles_filename):
                os.unlink(mbtiles_filename)
            if os.path.exists(pmtiles_filename):
                os.unlink(pmtiles_filename)

    @staticmethod
    def generate_map_tiles(tiles: TileDefinition, source: TileSource):

        stats = TileCacheStatistics()

        tile_definitions = tiles.tilesets()

        for t in tile_definitions:
            TileDownloader.generate_protomap_archive(t.name, t.tiles, source)

        return stats

    @staticmethod
    def process_map_generation_request(mgr: RasterMapGenerationRequest):

        with transaction.atomic():
            mgr.status = "PROCESSING"
            mgr.save()

        try:
            TileDownloader.generate_protomap_archive(
                f"gen_request_{mgr.id}",
                mgr.tileset,
                mgr.tile_definition_source,
                progress_reporter=GenerationRequestProgressReporter(mgr),
            )

            with transaction.atomic():
                mgr.status = "COMPLETED"
                mgr.save()
        except Exception as e:
            logging.error(e, exc_info=True)
            with transaction.atomic():
                mgr.status = "FAILED"
                mgr.save()
