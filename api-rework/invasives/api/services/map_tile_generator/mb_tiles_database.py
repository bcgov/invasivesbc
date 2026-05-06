import logging
import sqlite3
from dataclasses import dataclass
from typing import Literal

from api.services.map_tile_generator.tile_definitions import (
    TilesetCenter,
    TilesetBounds,
)

type TileFormat = Literal["png", "jpg"]


@dataclass
class MBTilesMetadata:
    format: TileFormat
    min_zoom: int
    max_zoom: int
    center: TilesetCenter
    bounds: TilesetBounds


class MBTilesDatabase:
    def __init__(self, filename: str, tileset_name: str, metadata: MBTilesMetadata):
        self.filename = filename
        self.tileset_name = tileset_name
        self.metadata = metadata

    def __enter__(self):
        self.db = sqlite3.connect(self.filename, autocommit=True)

        self.db.execute(
            "CREATE TABLE IF NOT EXISTS tiles (zoom_level integer,tile_column integer,tile_row integer,tile_data blob)"
        )
        self.db.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_tiles ON tiles (zoom_level, tile_column, tile_row)"
        )
        self.db.execute("CREATE TABLE IF NOT EXISTS metadata (name TEXT, value TEXT)")

        logging.info(f"bounds: {','.join(map(str, self.metadata.bounds))}")
        logging.info(f"center: {','.join(map(str, self.metadata.center))}")

        metadata_tuples = [
            ("name", self.tileset_name),
            ("version", "1.1"),
            ("type", "baseLayer"),
            ("format", self.metadata.format),
            ("bounds", ",".join(map(str, self.metadata.bounds))),
            ("center", ",".join(map(str, self.metadata.center))),
            ("minzoom", str(self.metadata.min_zoom)),
            ("maxzoom", str(self.metadata.max_zoom)),
        ]

        self.db.executemany(
            "INSERT OR REPLACE INTO metadata (name, value) values (?, ?)",
            metadata_tuples,
        )

        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.db.close()
