from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes import (
    AgentLocationFoundTerrainCode,
)


class LocationBiocontrolAgentsFoundMixin(models.Model):
    location_agent_found = models.ForeignKey(
        AgentLocationFoundTerrainCode, on_delete=models.PROTECT
    )

    class Meta:
        abstract = True


class LocationBiocontrolAgentsFoundTerrestrial(
    LocationBiocontrolAgentsFoundMixin, RepeatedFormData
):

    class Meta:
        db_table = '"activity"."bioagent_location_found_pt"'


class DraftLocationBiocontrolAgentsFoundTerrestrial(
    LocationBiocontrolAgentsFoundMixin, DraftRepeatedFormData
):

    class Meta:
        db_table = '"draft_activity"."bioagent_location_found_pt"'
