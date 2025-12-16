from django.db import models
from django.core.exceptions import ValidationError
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from invasivesbc.db_models.codes import CloudCoverCode, PrecipitationCode
from invasivesbc.db_models.enums import CardinalDirection

class WeatherConditions(BaseOneToOneActivityTable):
  """
    Weather Condition Details for Activity
    Used by:
      - Biocontrol Dispersal Monitoring
      - Biocontrol Release Monitoring
      - Biocontrol Collection
      - Biocontrol Release
  """
  temperature = models.PositiveSmallIntegerField()
  cloud_cover = models.ForeignKey(CloudCoverCode, on_delete=models.PROTECT)
  precipitation = models.ForeignKey(PrecipitationCode, on_delete=models.PROTECT)
  wind_speed_kmh = models.PositiveSmallIntegerField()
  wind_direction = models.CharField(choices=CardinalDirection)
  comments = models.TextField(max_length=512)


  class Meta:
    # db_table='"activity"."weather_conditions"'
    constraints = [
      models.UniqueConstraint(fields=["activity_id", "invasive_plant", "biocontrol_agent", "location_code"], name="unique_agent_found_location")
    ]

  def clean(self):
    if self.wind_direction is None and self.wind_speed_kmh > 0:
      raise ValidationError({"wind_direction": "Must specify a wind direction when wind speed > 0"})
