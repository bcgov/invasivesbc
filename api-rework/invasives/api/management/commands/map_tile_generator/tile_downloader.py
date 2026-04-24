import logging
import os
import sqlite3
import subprocess
import threading
from dataclasses import dataclass
from datetime import datetime, timedelta
from multiprocessing import process
from queue import Queue

import mercantile
import psycopg
from psycopg.rows import dict_row
from diskcache import Cache

from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING
import requests

ZOOM_RANGE = [4, 10, 17]

cache = Cache(directory=".tile-cache", size_limit=1024 * 1024 * 1024 * 8)


@dataclass
class TileGenerationStatistics:
    total_tiles: int = 0
    cache_hits: int = 0
    cache_misses: int = 0


class TileDownloader:
    def __init__(self):
        pass

    @staticmethod
    def generate_map_tiles(dry_run=False, skip_pmtiles=False, skip_upload=False):

        stats = TileGenerationStatistics()

        sourcing_query = f"select map_tile, st_xmin(geog::geometry) as west, st_xmax(geog::geometry) as east, st_ymin(geog::geometry) as south, st_ymax(geog::geometry) as north from public.nts_50k_grid order by map_tile asc"

        os.makedirs("output", exist_ok=True)

        with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                result = cursor.execute(sourcing_query)
                for row in result.fetchall():
                    mbtiles_filename = f"output/{row["map_tile"]}.mbtiles"
                    pmtiles_filename = f"output/{row["map_tile"]}.pmtiles"

                    with sqlite3.connect(mbtiles_filename) as tiledb:
                        tiledb.execute(
                            "CREATE TABLE IF NOT EXISTS tiles (zoom_level integer,tile_column integer,tile_row integer,tile_data blob)"
                        )
                        tiledb.execute(
                            "CREATE UNIQUE INDEX IF NOT EXISTS idx_tiles ON tiles (zoom_level, tile_column, tile_row)"
                        )
                        tiledb.execute(
                            "CREATE TABLE IF NOT EXISTS metadata (name TEXT, value TEXT)"
                        )

                        metadata_tuples = [
                            ("name", f"nts-50k-{row["map_tile"]}"),
                            ("version", "1.1"),
                            ("type", "baseLayer"),
                            ("format", "jpg"),
                        ]

                        tiledb.executemany(
                            "INSERT INTO metadata (name, value) values (?, ?)",
                            metadata_tuples,
                        )

                        tiles = list(
                            mercantile.tiles(
                                row["west"],
                                row["south"],
                                row["east"],
                                row["north"],
                                ZOOM_RANGE,
                            )
                        )

                        tiles_loaded = 0
                        last_report = datetime.now()

                        for tile in tiles:
                            stats.total_tiles += 1
                            cache_key = f"{tile.z}-${tile.x}-${tile.y}"

                            cached = cache.get(cache_key, default=None)
                            if cached is not None:
                                content = cached
                                stats.cache_hits += 1
                            else:
                                stats.cache_misses += 1
                                url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{tile.z}/{tile.y}/{tile.x}"
                                response = requests.get(url)
                                content = response.content
                                cache.set(
                                    cache_key, response.content, expire=3600 * 24 * 30
                                )

                            tiles_loaded += 1

                            if datetime.now() - last_report > timedelta(seconds=10):
                                last_report = datetime.now()
                                logging.info(
                                    f"{tiles_loaded} / {len(tiles)} ({round((tiles_loaded/len(tiles)) * 100.0, 2)}%)"
                                )

                            tile_file_name = f"output/{row["map_tile"]}/{tile.z}/{tile.y}/{tile.x}.jpg"
                            # os.makedirs(os.path.dirname(tile_file_name), exist_ok=True)
                            # with open(
                            #     tile_file_name,
                            #     "wb",
                            # ) as f:
                            #     f.write(content)

                            tiledb.execute(
                                "INSERT INTO tiles (zoom_level, tile_column, tile_row, tile_data) values (?, ?, ?, ?)",
                                (tile.z, tile.y, tile.x, content),
                            )

                    subprocess.run(
                        ["pmtiles", "convert", mbtiles_filename, pmtiles_filename]
                    )
                    os.unlink(mbtiles_filename)

        return stats
