from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

MAX_AREA = 500000


class Geometry(models.Model):
    """
    Geometry details for an activity Record
    consumed by:
      - All Activity Types
    @TODO: Update with PostGIS support for shapes | Constrain to BC Geometry
    """

    # centroid = models. # SUPPORT CENTROID
    # geom = models. # SUPPORT GEOMETRY. This should also support Multi-polygons.
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
    location_description = models.CharField(max_length=512, null=True)

    class Meta:
        abstract = True

    def clean(self):
        super().save()
        # Check Geometry/Lat/Long are in BC.
