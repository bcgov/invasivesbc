from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData


class TargetPlantHeightsMixin(models.Model):
    """
    1:M Height details for Target Plants, correlating to a Plant Phenology Report
    """

    height_cm = models.PositiveIntegerField(
        db_comment="Heights of the largest plants at a given site"
    )

    class Meta:
        abstract = True


class TargetPlantHeights(TargetPlantHeightsMixin, RepeatedFormData):

    class Meta:
        db_table = '"activity"."target_plant_heights"'


class DraftTargetPlantHeights(TargetPlantHeightsMixin, DraftRepeatedFormData):
    height_cm = models.IntegerField(
        db_comment="Heights of the largest plants at a given site"
    )

    class Meta:
        db_table = '"draft_activity"."target_plant_heights"'
