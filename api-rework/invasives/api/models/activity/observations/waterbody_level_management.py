from django.db import models

from api.models.activity import RepeatedFormData
from api.models.codes import WaterLevelManagement


class WaterbodyLevelManagement(RepeatedFormData):
    waterlevel_management = models.ForeignKey(
        WaterLevelManagement, on_delete=models.PROTECT
    )

    class Meta:
        db_table = '"activity"."water_level_management"'
