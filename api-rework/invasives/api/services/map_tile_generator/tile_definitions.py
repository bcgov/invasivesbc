from abc import ABC, abstractmethod
from collections import namedtuple
from dataclasses import dataclass
from typing import List

import mercantile
import psycopg
from mercantile import Tile
from psycopg.rows import dict_row

from api.models import RasterMapGenerationRequest
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING

# specs for the archive, from https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md
TilesetCenter = namedtuple("TilesetCenter", ["lng", "lat", "default_zoom"])
TilesetBounds = namedtuple("TilesetBounds", ["left", "bottom", "right", "top"])


@dataclass
class Tileset:
    name: str
    tiles: List[Tile]
    min_zoom: int
    max_zoom: int
    center: TilesetCenter
    bounds: TilesetBounds


class TileDefinition(ABC):

    @abstractmethod
    def tilesets(self) -> List[Tileset] | Tileset:
        pass


class MapGenerationRequestDefinition(TileDefinition):
    def __init__(self, map_generation_request: RasterMapGenerationRequest):
        self.map_generation_request = map_generation_request

    def tilesets(self) -> Tileset:
        return self.map_generation_request.tileset


class NTSGridTileDefinition(TileDefinition):

    def __init__(self, min_zoom, max_zoom):
        self.min_zoom = min_zoom
        self.max_zoom = max_zoom

    def tilesets(self) -> List[Tileset]:

        tilesets_to_generate: List[Tileset] = []

        sourcing_query = (
            f"select map_tile,"
            f" st_xmin(geog::geometry) as west,"
            f" st_xmax(geog::geometry) as east,"
            f" st_ymin(geog::geometry) as south,"
            f" st_ymax(geog::geometry) as north,"
            f" st_x(st_centroid(geog::geometry)) as center_longitude,"
            f" st_y(st_centroid(geog::geometry)) as center_latitude"
            f" from public.nts_50k_grid order by map_tile asc"
        )

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
                            range(self.min_zoom, self.max_zoom + 1),
                        )
                    )

                    tilesets_to_generate.append(
                        Tileset(
                            name=f"nts-grid-50k-{row["map_tile"]}",
                            tiles=tiles,
                            min_zoom=self.min_zoom,
                            max_zoom=self.max_zoom,
                            center=TilesetCenter(
                                row["center_longitude"],
                                row["center_latitude"],
                                self.min_zoom,
                            ),
                            bounds=TilesetBounds(
                                row["west"], row["south"], row["east"], row["north"]
                            ),
                        )
                    )

        return tilesets_to_generate
