from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes import (
    AgentLocationFoundTerrainCode,
)


class BaseModel(models.Model):
    location_agent_found = models.ForeignKey(
        AgentLocationFoundTerrainCode, on_delete=models.PROTECT
    )

    class Meta:
        abstract = True


class LocationBiocontrolAgentsFoundTerrestrial(BaseModel, RepeatedFormData):

    class Meta:
        db_table = '"activity"."bioagent_location_found_pt"'


class DraftLocationBiocontrolAgentsFoundTerrestrial(BaseModel, DraftRepeatedFormData):

    class Meta:
        db_table = '"draft_activity"."bioagent_location_found_pt"'
