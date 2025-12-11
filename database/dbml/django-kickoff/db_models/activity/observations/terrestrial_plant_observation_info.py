from django.db import models
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from invasivesbc.db_models.codes import SpecificUseCode, SlopePercentCode, AspectCode, SoilTextureCode
from invasivesbc.db_models.enums import YesNoUnknown

class TerrestrialPlantObservationInfo(BaseOneToOneActivityTable):
  soil_texture = models.ForeignKey(SoilTextureCode, on_delete=models.PROTECT)
  research_observation = models.CharField(choices=YesNoUnknown)
  aspect = models.ForeignKey(AspectCode, on_delete=models.PROTECT)
  specific_use = models.ForeignKey(SpecificUseCode, on_delete=models.PROTECT)
  visible_well_nearby = models.CharField(choices=YesNoUnknown)
  slope_percent = models.ForeignKey(SlopePercentCode, on_delete=models.PROTECT)

  class Meta:
    # db_table='"activity"."ter_plant_observation_info"'
    db_table_comment="Details of surrounding area for a terrestrial activity."
