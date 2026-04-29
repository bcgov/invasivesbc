from abc import ABC, abstractmethod
from typing import Literal


class TileSource(ABC):

    @property
    @abstractmethod
    def cache_area(self) -> str:
        pass

    @property
    @abstractmethod
    def tile_format(self) -> Literal["jpg", "png"]:
        pass

    @property
    def cache_lifetime_seconds(self) -> int:
        return 3600

    @abstractmethod
    def build_url(self, z: int, y: int, x: int) -> str:
        raise NotImplementedError()


class ESRIWorldImageryTileSource(TileSource):
    def __init__(self):
        pass

    @property
    def cache_area(self) -> str:
        return "esri-world-imagery"

    @property
    def cache_lifetime_seconds(self) -> int:
        return 180 * 24 * 3600  # long cache ttl for this tileset

    @property
    def tile_format(self) -> Literal["jpg", "png"]:
        return "jpg"

    def build_url(self, z: int, y: int, x: int) -> str:
        return f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
