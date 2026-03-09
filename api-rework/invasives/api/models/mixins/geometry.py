from django.contrib.gis.db import models as geomodels
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

MAX_AREA = 500000


class Geometry(models.Model):
    """
    Geometry details for an activity Record
    consumed by:
      - All Activity Types
    @TODO: Constrain to BC Geometry
    """

    area_m = models.PositiveBigIntegerField(
        validators=[MaxValueValidator(MAX_AREA)], null=True
    )
    utm_zone = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(7), MaxValueValidator(12)], null=True
    )
    utm_easting = models.PositiveBigIntegerField(null=True)
    utm_northing = models.PositiveBigIntegerField(null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True)
    location_description = models.CharField(max_length=16384, null=True)

    shape = geomodels.GeometryField(
        srid=4326, geography=False, spatial_index=True, null=False
    )
    shape_radius = models.DecimalField(
        max_digits=17,
        decimal_places=16,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )

    class Meta:
        abstract = True

    def clean(self):
        super().save()
        # Check Geometry/Lat/Long are in BC.
        # Check radius is shape is point. No radius is shape is not point.
