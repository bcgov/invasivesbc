from django.db import models
from django.core.exceptions import ValidationError
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from invasivesbc.db_models.codes import SlopePercentCode, AspectCode, SoilTextureCode
from invasivesbc.db_models.enums import YesNoUnknown

class TerrestrialPlantObservationInfo(BaseOneToOneActivityTable):
  """
    section title:
      Observation Plant Terrestrial Information
    consumed by:
      - Terrestrial Invasive Plant Observation
  """
  soil_texture = models.ForeignKey(SoilTextureCode, on_delete=models.PROTECT)
  research_observation = models.CharField(choices=YesNoUnknown)
  aspect = models.ForeignKey(AspectCode, on_delete=models.PROTECT)
  visible_well_nearby = models.CharField(choices=YesNoUnknown)
  slope_percent = models.ForeignKey(SlopePercentCode, on_delete=models.PROTECT)

  class Meta:
    # db_table='"activity"."ter_plant_observation_info"'
    db_table_comment="Details of surrounding area for a terrestrial activity."

  def clean(self):
    super().clean()

    # @TODO Link Flat Codes
    # if self.slope_percent == "SLOPE_FLAT_CODE" and self.aspect != "ASPECT_FLAT_CODE" \
    #   or self.slope_percent != "SLOPE_FLAT_CODE" and self.aspect == "ASPECT_FLAT_CODE":
    #   raise ValidationError({
    #     "slope_percent", "If either Aspect or Slope is flat, both of them must be flat.",
    #     "aspect", "If either Aspect or Slope is flat, both of them must be flat.",
    #   })
