from collections import namedtuple
from typing import List

import mercantile
from django.contrib.gis.db import models as geomodels
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator
from django.db import models
from django.db.models import Q

from api.models.map_generation.map_generation_record import generate_legacy_trip_name
from api.models.mixins.dated import Dated
from api.models.mixins.owned import OptionallyOwned
from api.services.map_tile_generator.tile_source import ESRIWorldImageryTileSource

TileDefinitionNameToInstanceMap = namedtuple(
    "TileDefinitionNameToInstanceMap", ["name", "source"]
)

TILE_SOURCE_DEFINITION_MAP: List[TileDefinitionNameToInstanceMap] = [
    TileDefinitionNameToInstanceMap(
        name="esri-world-imagery", source=ESRIWorldImageryTileSource()
    )
]

# assumptions
AVERAGE_SIZE_OF_TILE = 16000
TILES_PER_SECOND_WORST_CASE = 3
TILES_PER_SECOND_BEST_CASE = 15

MAX_TILE_COUNT = 20000


class RasterMapGenerationRequest(OptionallyOwned, Dated, models.Model):
    id = models.AutoField(primary_key=True, null=False, blank=False)

    trip_name = models.CharField(
        max_length=256,
        null=False,
        default=generate_legacy_trip_name,
        db_comment="trip name, used as a client-side identifier. Eventually to be replaced with server-side trip reference",
    )

    bounds = geomodels.PolygonField(null=False, blank=False)

    minimum_zoom = models.PositiveSmallIntegerField(
        default=0,
        validators=[MaxValueValidator(24)],
    )

    maximum_zoom = models.PositiveSmallIntegerField(
        default=15,
        validators=[MaxValueValidator(24)],
    )

    tile_definition_source_name = models.CharField(
        max_length=255,
        default="esri-world-imagery",
        null=False,
        blank=False,
    )

    file_name = models.CharField(
        max_length=512,
        unique=True,
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=32,
        null=False,
        blank=False,
        default="PENDING",
    )

    @property
    def tileset(self):
        (xmin, ymin, xmax, ymax) = self.bounds.extent

        return list(
            mercantile.tiles(
                xmin,
                ymin,
                xmax,
                ymax,
                zooms=range(self.minimum_zoom, self.maximum_zoom + 1),
            )
        )

    @property
    def area_km2(self):
        return round(self.bounds.transform(6933, clone=True).area / 1000000.0, 2)

    @property
    def total_tile_count(self):
        return len(self.tileset)

    @property
    def estimated_download_time_worst_case(self):
        return round(self.total_tile_count / TILES_PER_SECOND_WORST_CASE, 0)

    @property
    def estimated_download_time_best_case(self):
        return round(self.total_tile_count / TILES_PER_SECOND_BEST_CASE, 0)

    @property
    def estimated_final_size(self):
        return AVERAGE_SIZE_OF_TILE * self.total_tile_count

    @property
    def tile_definition_source(self):
        return next(
            (
                t.source
                for t in TILE_SOURCE_DEFINITION_MAP
                if t.name == self.tile_definition_source_name
            ),
            None,
        )

    def clean(self):
        super().clean()
        if self.minimum_zoom > self.maximum_zoom:
            raise ValidationError(
                {
                    "minimum_zoom": "Cannot be greater than maximum_zoom",
                }
            )

        if self.status not in [
            "PENDING",
            "PROCESSING",
            "COMPLETED",
            "FAILED",
        ]:
            raise ValidationError(
                {
                    "status": "Unknown status",
                }
            )

        if self.tile_definition_source_name not in [
            t.name for t in TILE_SOURCE_DEFINITION_MAP
        ]:
            raise ValidationError(
                {
                    "tile_definition_source_name": "Unknown tile definition source name",
                }
            )

        if self.total_tile_count > MAX_TILE_COUNT:
            raise ValidationError(
                {
                    "maximum_zoom": "Dataset too large. Reduce area or maximum zoom",
                }
            )

    class Meta:
        db_table = '"activity"."raster_map_generation_request"'
        db_table_comment = "Request for generation of raster map, with bounds and zoom level, along with the status of the request."
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "trip_name"],
                condition=Q(owner__isnull=False) & Q(trip_name__isnull=False),
                name="raster_map_generation_request_trip_name_unique_if_not_null",
            )
        ]
