import sqlite3
from typing import Literal

type TileFormat = Literal["png", "jpg"]


class MBTilesDatabase:
    def __init__(self, filename: str, tileset_name: str, tile_format: TileFormat):
        self.filename = filename
        self.tileset_name = tileset_name
        self.tile_format = tile_format

    def __enter__(self):
        self.db = sqlite3.connect(self.filename, autocommit=True)

        self.db.execute(
            "CREATE TABLE IF NOT EXISTS tiles (zoom_level integer,tile_column integer,tile_row integer,tile_data blob)"
        )
        self.db.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_tiles ON tiles (zoom_level, tile_column, tile_row)"
        )
        self.db.execute("CREATE TABLE IF NOT EXISTS metadata (name TEXT, value TEXT)")

        metadata_tuples = [
            ("name", self.tileset_name),
            ("version", "1.1"),
            ("type", "baseLayer"),
            ("format", self.tile_format),
        ]

        self.db.executemany(
            "INSERT OR REPLACE INTO metadata (name, value) values (?, ?)",
            metadata_tuples,
        )

        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.db.close()
