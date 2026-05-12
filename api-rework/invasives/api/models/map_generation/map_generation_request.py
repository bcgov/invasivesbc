from collections import namedtuple
from typing import List

import mercantile
from django.contrib.gis.db import models as geomodels
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator
from django.db import models

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


class RasterMapGenerationRequest(OptionallyOwned, Dated, models.Model):
    id = models.AutoField(primary_key=True, null=False, blank=False)

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
                zooms=range(self.minimum_zoom, self.maximum_zoom),
            )
        )

    @property
    def total_tile_count(self):
        return len(self.tileset)

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

        if self.total_tile_count > 100000:
            raise ValidationError(
                {
                    "maximum_zoom": "Dataset too large. Reduce area or maximum zoom",
                }
            )

    class Meta:
        db_table = '"activity"."raster_map_generation_request"'
