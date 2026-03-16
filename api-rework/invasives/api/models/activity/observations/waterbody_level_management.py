from django.db import models

from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from api.models.codes import WaterLevelManagement


class WaterbodyLevelManagement(BaseOneToManyActivityTable):
    waterlevel_management = models.ForeignKey(
        WaterLevelManagement, on_delete=models.PROTECT
    )

    class Meta:
        db_table = '"activity"."water_level_management"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "waterlevel_management"],
                name="unique_activity_waterlevel_management",
            )
        ]
