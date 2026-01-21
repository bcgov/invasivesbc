from django.db import models
from api.models.activity import BaseOneToManyActivityTable
from api.models.codes import (
  AgentLocationFoundTerrainCode,
  BiocontrolAgentCode,
  TerrestrialPlantCode
)

class LocationBiocontrolAgentsFoundTerrestrial(BaseOneToManyActivityTable):
  location_agent_found = models.ForeignKey(AgentLocationFoundTerrainCode, on_delete=models.PROTECT)
  invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)
  biocontrol_agent = models.ForeignKey(BiocontrolAgentCode, on_delete=models.PROTECT)

  class Meta:
    db_table = '"activity"."location_biocontrol_agents_found_terrestrial"'
    constraints = [
      models.UniqueConstraint(
        fields=["location_agent_found", "invasive_plant", "biocontrol_agent", "activity"],
        name="unique_location_biocontrol_agent",
      )
    ]
