from datetime import datetime, time, timedelta
import logging
import os
import subprocess
from typing import List, Optional

import boto3
from botocore.exceptions import ClientError
import diskcache
from diskcache import Cache
from django.utils import timezone
import mercantile
import requests
from requests import RequestException

from api.models import (
    CachedRasterTile,
    MapGenerationIntermediateResult,
    MapGenerationRecord,
    RasterMapGenerationRequest,
)
from api.services.map_tile_generator.definitions import (
    CacheAccessMode,
    ProtomapGenerationParameters,
    TileCacheStatistics,
    TileRetrieveResult,
)
from api.services.map_tile_generator.mb_tiles_database import (
    MBTilesDatabase,
    MBTilesMetadata,
)
from api.services.map_tile_generator.tile_definitions import (
    TilesetBounds,
    TilesetCenter,
)
from api.services.map_tile_generator.tile_source import (
    TileSource,
)
from invasivesbc.settings import (
    DATABASE_CACHE_ZOOM_RANGE,
    LOCAL_CACHE_ZOOM_RANGE,
    OBJECT_STORE_ACCESS_KEY_ID,
    OBJECT_STORE_ENDPOINT_URL,
    OBJECT_STORE_MAP_UPLOAD_BUCKET,
    OBJECT_STORE_SECRET_ACCESS_KEY,
    SCRATCH_DIRECTORY,
    TILE_CACHE_MAXIMUM_SIZE,
    OBJECT_STORE_REGION,
)

cache = Cache(
    directory=os.path.join(SCRATCH_DIRECTORY, ".tile-cache"),
    size_limit=TILE_CACHE_MAXIMUM_SIZE,
)


class TileRetrieveException(Exception):
    pass


class TileDownloader:

    def __init__(self):
        pass

    @staticmethod
    def retrieve_tile(
        source: TileSource,
        tile: mercantile.Tile,
        cache_mode: CacheAccessMode = CacheAccessMode(0),  # no flags by default
    ) -> TileRetrieveResult:
        """
        Retrieve a tile from the source, employing caching mechanisms

        :param source: tile source definition
        :param tile: coordinates of tile to retrieve
        :param cache_mode: override caching behaviour
        :return: TileRetrieveResult
        :raises: TileRetrieveException on retrieval failure
        """

        cache_key = f"{source.cache_area}-{tile.z}-{tile.x}-{tile.y}"

        # first we try the (local) disk cache
        if tile.z in LOCAL_CACHE_ZOOM_RANGE and not (
            cache_mode & cache_mode.DISABLE_READS
        ):
            cached = cache.get(cache_key, default=None)
            if cached is not None:
                return TileRetrieveResult(hit=True, data=cached)

        # now try the database cache
        if tile.z in DATABASE_CACHE_ZOOM_RANGE and not (
            cache_mode & cache_mode.DISABLE_READS
        ):
            cached = CachedRasterTile.objects.filter(key=cache_key).first()

            if cached is not None:
                if tile.z in LOCAL_CACHE_ZOOM_RANGE:
                    # copy l2 -> l1 cache for next time, if appropriate
                    if not cache_mode & cache_mode.DISABLE_L1_WRITES:
                        cache.set(
                            cache_key,
                            cached.data,
                            expire=source.cache_lifetime_seconds,
                        )
                return TileRetrieveResult(hit=True, data=cached.data)

        url = source.build_url(tile.z, tile.y, tile.x)

        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()  # raise an exception on HTTP error code

            # add to local cache
            if tile.z in LOCAL_CACHE_ZOOM_RANGE and not (
                cache_mode & cache_mode.DISABLE_L1_WRITES
            ):
                cache.set(
                    cache_key,
                    response.content,
                    expire=source.cache_lifetime_seconds,
                )

            # add to database cache
            if tile.z in DATABASE_CACHE_ZOOM_RANGE and not (
                cache_mode & cache_mode.DISABLE_L2_WRITES
            ):
                CachedRasterTile.objects.update_or_create(
                    key=cache_key,
                    defaults={
                        "data": response.content,
                        "expires": timezone.now()
                        + timedelta(seconds=source.cache_lifetime_seconds),
                    },
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
    def generate_protomap_archive(options: ProtomapGenerationParameters):

        mgr = RasterMapGenerationRequest.objects.filter(
            id=options.map_generation_request_id
        ).first()

        if mgr is None:
            logging.warning(
                f"map generation request {options.map_generation_request_id} not found"
            )
            return

        if mgr.status != "PENDING":
            logging.warning(
                f"map generation request {options.map_generation_request_id} has unexpected status: {mgr.status}, not processing"
            )
            return

        logging.info(
            f"Processing map generation request {mgr.file_name}"
            f" for [{mgr.owner if mgr.owner else "SYSTEM"}],"
            f" [{len(mgr.tileset)} tiles],"
            f" [zoom {mgr.maximum_zoom}],"
            f" [{mgr.area_km2} km²]"
        )

        mbtiles_filename = os.path.join(
            SCRATCH_DIRECTORY, f"output/{mgr.file_name}.mbtiles"
        )
        pmtiles_filename = os.path.join(
            SCRATCH_DIRECTORY, f"output/{mgr.file_name}.pmtiles"
        )

        mgr.status = "PROCESSING"
        mgr.save()
        completed_successfully = False  # flag used later for updating mgr status

        start_time = datetime.now()

        try:
            os.makedirs(os.path.join(SCRATCH_DIRECTORY, "output"), exist_ok=True)

            metadata = MBTilesMetadata(
                min_zoom=mgr.minimum_zoom,
                max_zoom=mgr.maximum_zoom,
                format=mgr.tile_definition_source.tile_format,
                bounds=TilesetBounds(
                    mgr.bounds.extent[0],
                    mgr.bounds.extent[1],
                    mgr.bounds.extent[2],
                    mgr.bounds.extent[3],
                ),
                center=TilesetCenter(
                    mgr.bounds.centroid.x,
                    mgr.bounds.centroid.y,
                    mgr.minimum_zoom,
                ),
            )

            with MBTilesDatabase(mbtiles_filename, mgr.file_name, metadata) as tiledb:
                stats = TileCacheStatistics()

                tiles_loaded = 0

                for tile in mgr.tileset:

                    try:
                        stats.total_tiles += 1
                        result = TileDownloader.retrieve_tile(
                            mgr.tile_definition_source,
                            tile,
                            cache_mode=options.cache_mode,
                        )

                        if result.hit:
                            stats.cache_hits += 1
                        else:
                            stats.cache_misses += 1

                        MapGenerationIntermediateResult.objects.update_or_create(
                            generation_request=mgr,
                            defaults={
                                "tiles_downloaded": stats.total_tiles,
                                "cache_hits": stats.cache_hits,
                                "cache_misses": stats.cache_misses,
                                "remaining_tiles": mgr.total_tile_count
                                - stats.total_tiles,
                                "owner": mgr.owner,
                                "seconds_elapsed": (
                                    datetime.now() - start_time
                                ).total_seconds(),
                                "status_information": f"{(datetime.now() - start_time).__str__()} elapsed",
                            },
                        )

                        tiledb.db.execute(
                            "INSERT OR REPLACE INTO tiles (zoom_level, tile_column, tile_row, tile_data) values (?, ?, ?, ?)",
                            (tile.z, tile.x, (1 << tile.z) - 1 - tile.y, result.data),
                        )

                    except TileRetrieveException as e:
                        logging.warning(f"tile retrieve failure: {e}", exc_info=True)
                        stats.errors += 1

                    tiles_loaded += 1

            subprocess.run(
                ["pmtiles", "convert", mbtiles_filename, pmtiles_filename],
                capture_output=True,
                check=True,
                text=True,
            )

            s3_client = boto3.client(
                "s3",
                endpoint_url=OBJECT_STORE_ENDPOINT_URL,
                aws_access_key_id=OBJECT_STORE_ACCESS_KEY_ID,
                aws_secret_access_key=OBJECT_STORE_SECRET_ACCESS_KEY,
                aws_session_token=None,
                region_name=OBJECT_STORE_REGION,
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
                    f"maps/{mgr.file_name}.pmtiles",
                    ExtraArgs={"ACL": "public-read"} if mgr.owner is None else {},
                )
                logging.info(f"PMTiles upload complete for {pmtiles_filename}")

                # create a corresponding map generation record
                record, _ = MapGenerationRecord.objects.update_or_create(
                    file_name=f"maps/{mgr.file_name}.pmtiles",
                    defaults={
                        "generation_request": mgr,
                        "file_size": os.path.getsize(pmtiles_filename),
                        "trip_name": mgr.trip_name,
                        "expires": (
                            timezone.now() + timedelta(days=7)
                            if mgr.owner is not None
                            else None
                        ),
                        "raster": True,
                        "description": (
                            f"System-generated base map grid"
                            if mgr.owner is None
                            else f"User-generated map archive"
                        ),
                        "bounds": mgr.bounds,
                        "minimum_zoom": mgr.minimum_zoom,
                        "maximum_zoom": mgr.maximum_zoom,
                        "owner": mgr.owner,
                    },
                )

                completed_successfully = True

            except ClientError as e:
                logging.error("Unable to upload file to object store", exc_info=True)
                raise e

        finally:
            if os.path.exists(mbtiles_filename):
                os.unlink(mbtiles_filename)
            if os.path.exists(pmtiles_filename):
                os.unlink(pmtiles_filename)
            mgr.status = "COMPLETED" if completed_successfully else "FAILED"
            mgr.save()
            logging.info(
                f"processing of {mgr.file_name} [status {mgr.status}] [hit {stats.cache_hits}/{stats.total_tiles} {round(100.0 * (stats.cache_hits/stats.total_tiles), 1)}%]"
            )

        return stats
