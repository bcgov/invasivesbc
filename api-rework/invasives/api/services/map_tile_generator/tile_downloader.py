import logging
import os
import subprocess
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional

import boto3
import diskcache
import mercantile
import requests
from botocore.exceptions import ClientError
from diskcache import Cache
from requests import RequestException

from api.services.map_tile_generator.mb_tiles_database import MBTilesDatabase
from api.services.map_tile_generator.tile_definitions import NTSGridTileDefinition
from api.services.map_tile_generator.tile_source import (
    ESRIWorldImageryTileSource,
    TileSource,
)
from invasivesbc.settings import (
    SCRATCH_DIRECTORY,
    TILE_CACHE_MAXIMUM_SIZE,
    OBJECT_STORE_ENDPOINT_URL,
    OBJECT_STORE_ACCESS_KEY_ID,
    OBJECT_STORE_SECRET_ACCESS_KEY,
    OBJECT_STORE_MAP_UPLOAD_BUCKET,
)

ZOOM_RANGE = range(5, 14)

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


class TileDownloader:
    def __init__(self):
        pass

    @staticmethod
    def preheat_cache(
        tiles: List[mercantile.Tile],
        source: TileSource,
        max_downloads: Optional[int] = None,
    ):
        stats = TileCacheStatistics()

        for tile in tiles:
            cache_key = f"{source.cache_area}-{tile.z}-${tile.x}-${tile.y}"
            cached = cache.get(cache_key, default=None)
            stats.total_tiles += 1

            if max_downloads is not None and stats.cache_misses >= max_downloads:
                logging.info(
                    "max hit count reached, terminating run"
                )  # this mechanism is intended to limit the runtime of the preheat function, for use in periodic tasks keeping the cache fresh
                return stats

            if cached is not None:
                stats.cache_hits += 1
            else:
                stats.cache_misses += 1
                url = source.build_url(tile.z, tile.y, tile.x)
                try:
                    response = requests.get(url, timeout=5)
                    response.raise_for_status()  # raise an exception on HTTP error code

                    cache.set(
                        cache_key,
                        response.content,
                        expire=source.cache_lifetime_seconds,
                    )
                except RequestException as e:
                    logging.warning(f"tile download failure: {url}", exc_info=True)
                    stats.errors += 1
                except diskcache.Timeout as e:
                    logging.error("cache timeout")
                    stats.errors += 1

        return stats

    @staticmethod
    def generate_protomap_archive(
        tileset_name: str,
        tiles: List[mercantile.Tile],
        source: TileSource,
    ):
        mbtiles_filename = os.path.join(
            SCRATCH_DIRECTORY, f"output/{tileset_name}.mbtiles"
        )
        pmtiles_filename = os.path.join(
            SCRATCH_DIRECTORY, f"output/{tileset_name}.pmtiles"
        )

        os.makedirs(os.path.join(SCRATCH_DIRECTORY, "output"), exist_ok=True)

        try:
            with MBTilesDatabase(
                mbtiles_filename, tileset_name, source.tile_format
            ) as tiledb:
                stats = TileCacheStatistics()

                tiles_loaded = 0
                last_report = datetime.now()

                for tile in tiles:
                    stats.total_tiles += 1
                    cache_key = f"{source.cache_area}-{tile.z}-${tile.x}-${tile.y}"

                    cached = cache.get(cache_key, default=None)
                    if cached is not None:
                        content = cached
                        stats.cache_hits += 1
                    else:
                        stats.cache_misses += 1
                        url = source.build_url(tile.z, tile.y, tile.x)
                        response = requests.get(url, timeout=10)
                        content = response.content
                        cache.set(
                            cache_key,
                            content,
                            expire=source.cache_lifetime_seconds,
                        )

                    tiles_loaded += 1

                    if datetime.now() - last_report > timedelta(seconds=10):
                        last_report = datetime.now()
                        logging.info(
                            f"{tiles_loaded} / {len(tiles)} ({round((tiles_loaded/len(tiles)) * 100.0, 2)}%)"
                        )

                    tiledb.db.execute(
                        "INSERT OR REPLACE INTO tiles (zoom_level, tile_column, tile_row, tile_data) values (?, ?, ?, ?)",
                        (tile.z, tile.y, tile.x, content),
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

        except Exception as e:
            logging.error(
                f"Error encountered on tileset {tileset_name}",
                exc_info=True,
            )
        finally:
            os.unlink(mbtiles_filename)
            os.unlink(pmtiles_filename)

    @staticmethod
    def generate_map_tiles():

        stats = TileCacheStatistics()

        tile_definitions = NTSGridTileDefinition(zoom_range=ZOOM_RANGE).tilesets()

        source = ESRIWorldImageryTileSource()

        for t in tile_definitions:
            TileDownloader.generate_protomap_archive(t.name, t.tiles, source)

        return stats
