from django.db import models

from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes import WaterLevelManagement


class BaseModel(models.Model):
    waterlevel_management = models.ForeignKey(
        WaterLevelManagement, on_delete=models.PROTECT
    )

    class Meta:
        abstract = True


class WaterbodyLevelManagement(BaseModel, RepeatedFormData):
    class Meta:
        db_table = '"activity"."water_level_management"'


class DraftWaterbodyLevelManagement(BaseModel, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."water_level_management"'
