from django.db import models
from api.models.enums import WaterLevelManagement
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable


class WaterbodyLevelManagement(BaseOneToManyActivityTable):
    waterlevel_management = models.CharField(WaterLevelManagement)

    class Meta:
        db_table = '"activity"."water_level_management"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity_id", "waterlevel_management"],
                name="unique_activity_waterlevel_management",
            )
        ]
