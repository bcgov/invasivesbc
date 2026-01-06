from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable


class TargetPlantHeights(BaseOneToManyActivityTable):
    """
    1:M Height details for Target Plants, correlating to a Plant Phenology Report
    """

    height_cm = models.PositiveIntegerField(
        db_comment="Heights of the largest plants at a given site"
    )

    class Meta:
        db_table = '"activity"."target_plant_heights"'
        pass
