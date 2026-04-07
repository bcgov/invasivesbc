from django.db import models
from api.models.codes.code_tables import WaterbodyUseCode, AdjacentLandUseCode
from api.models.activity import RepeatedFormData


class WaterbodyUse(RepeatedFormData):
    waterbody_use = models.ForeignKey(WaterbodyUseCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."water_use"'


class WaterbodyAdjacentLandUse(RepeatedFormData):
    waterbody_adjacent_land_use = models.ForeignKey(
        AdjacentLandUseCode, on_delete=models.PROTECT
    )

    class Meta:
        db_table = '"activity"."water_adjacent_land_use"'
