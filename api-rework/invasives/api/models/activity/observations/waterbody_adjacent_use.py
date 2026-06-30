from django.db import models
from api.models.codes.code_tables import AdjacentLandUseCode
from api.models.activity import RepeatedFormData, DraftRepeatedFormData


class BaseModel(models.Model):
    waterbody_adjacent_land_use = models.ForeignKey(
        AdjacentLandUseCode, on_delete=models.PROTECT
    )

    class Meta:
        abstract = True


class WaterbodyAdjacentLandUse(BaseModel, RepeatedFormData):
    class Meta:
        db_table = '"activity"."water_adjacent_land_use"'


class DraftWaterbodyAdjacentLandUse(BaseModel, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."water_adjacent_land_use"'
