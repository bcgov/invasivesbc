from django.db import models
from api.models.activity import RepeatedFormData
from api.models.codes import (
    AgentLocationFoundTerrainCode,
)


class LocationBiocontrolAgentsFoundTerrestrial(RepeatedFormData):
    location_agent_found = models.ForeignKey(
        AgentLocationFoundTerrainCode, on_delete=models.PROTECT
    )

    class Meta:
        db_table = '"activity"."bioagent_location_found_pt"'
