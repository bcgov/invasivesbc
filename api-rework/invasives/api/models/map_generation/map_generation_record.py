import uuid

from django.core.validators import MaxValueValidator
from django.db import models
from django.db.models import SET_NULL, Q

from api.models.mixins.dated import Dated
from api.models.mixins.owned import OptionallyOwned
from django.contrib.gis.db import models as geomodels


def generate_legacy_trip_name():
    return f"trip-{uuid.uuid4().hex[:12].upper()}"


class MapGenerationRecord(OptionallyOwned, Dated, models.Model):
    id = models.AutoField(primary_key=True, null=False, blank=False)

    file_name = models.CharField(
        max_length=512,
        unique=True,
        null=True,
        blank=True,
    )

    trip_name = models.CharField(
        max_length=256,
        null=False,
        default=generate_legacy_trip_name,
        db_comment="trip name, used as a client-side identifier. Eventually to be replaced with server-side trip reference",
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

    @property
    def area_km2(self):
        return round(self.bounds.transform(6933, clone=True).area / 1000000.0, 2)

    class Meta:
        db_table = '"activity"."raster_map_generation_rcord"'
        db_table_comment = (
            "Permanent record of generated raster maps (both public and private)"
        )
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "trip_name"],
                condition=Q(owner__isnull=False) & Q(trip_name__isnull=False),
                name="raster_map_generation_record_trip_name_unique_if_not_null",
            )
        ]
