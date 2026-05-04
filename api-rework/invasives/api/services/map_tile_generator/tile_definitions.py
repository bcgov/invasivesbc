from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Tuple

import mercantile
import psycopg
from mercantile import Tile
from psycopg.rows import dict_row

from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING


@dataclass
class Tileset:
    name: str
    tiles: List[Tile]


class TileDefinition(ABC):

    @abstractmethod
    def tilesets(self) -> List[Tileset] | Tileset:
        pass


class NTSGridTileDefinition(TileDefinition):

    def __init__(self, zoom_range):
        self.zoom_range = zoom_range

    def tilesets(self) -> List[Tileset]:

        tilesets_to_generate: List[Tileset] = []

        sourcing_query = f"select map_tile, st_xmin(geog::geometry) as west, st_xmax(geog::geometry) as east, st_ymin(geog::geometry) as south, st_ymax(geog::geometry) as north from public.nts_50k_grid order by map_tile asc"

        with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                result = cursor.execute(sourcing_query)
                for row in result.fetchall():

                    tiles = list(
                        mercantile.tiles(
                            row["west"],
                            row["south"],
                            row["east"],
                            row["north"],
                            self.zoom_range,
                        )
                    )

                    tilesets_to_generate.append(
                        Tileset(name=f"nts-grid-50k-{row["map_tile"]}", tiles=tiles)
                    )

        return tilesets_to_generate
