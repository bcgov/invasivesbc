from django.core.validators import MaxValueValidator
from django.db import models
from django.db.models import SET_NULL

from api.models.mixins.dated import Dated
from api.models.mixins.owned import OptionallyOwned
from django.contrib.gis.db import models as geomodels


class MapGenerationRecord(OptionallyOwned, Dated, models.Model):
    id = models.AutoField(primary_key=True, null=False, blank=False)

    file_name = models.CharField(
        max_length=512,
        unique=True,
        null=True,
        blank=True,
    )

    file_size = models.PositiveIntegerField(null=True, blank=True)

    expires = models.DateTimeField(
        blank=True,
        null=True,
        db_comment="Datetime after which this record may be deleted to reclaim space",
    )

    description = models.TextField(blank=True, null=True)

    raster = models.BooleanField(
        null=False,
        blank=False,
        default=True,
        db_comment="True if this is a raster map (false for vector)",
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

    generation_request = models.OneToOneField(
        "RasterMapGenerationRequest",
        on_delete=SET_NULL,
        blank=True,
        null=True,
        db_comment="Optional map generation request that caused this record to be created (may be null for system-generated maps)",
    )

    class Meta:
        db_table = '"activity"."raster_map_generation_rcord"'
