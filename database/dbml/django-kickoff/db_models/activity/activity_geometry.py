from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToOneActivityTable

MAX_AREA = 500000
class ActivityGeometry(BaseOneToOneActivityTable):
  """
    Geometry details for an activity Record
    consumed by:
      - All Activity Types
    @TODO: Update with PostGIS support for shapes | Constrain to BC Geometry
  """
  # centroid = models. # SUPPORT CENTROID
  # geom = models. # SUPPORT GEOMETRY. This should also support Multi-polygons.
  area_m = models.PositiveBigIntegerField(validators=[MaxValueValidator(MAX_AREA)])
  utm_zone = models.PositiveSmallIntegerField(validators=[MinValueValidator(7),MaxValueValidator(12)])
  utm_easting = models.PositiveBigIntegerField()
  utm_northing = models.PositiveBigIntegerField()
  latitude = models.DecimalField()
  longitude = models.DecimalField()
  location_description = models.CharField(max_length=512)

  class Meta:
    # db_table='"activity"."activity_geometry"'
    # indexes = [
    #   models.Index(fields=["centroid"], name="activity_geom_idx"),
    #   models.Index(fields=["geom"], name="activity_geom_idx"),
    # ]
    pass

  def clean(self):
    super().save()
    # Check Geometry/Lat/Long are in BC.
