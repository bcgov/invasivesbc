from django.db import models
from api.models.codes.code_tables import WaterbodyUseCode, AdjacentLandUseCode
from api.models.activity import RepeatedFormData, DraftRepeatedFormData


###
# Waterbody Use
###
class WaterbodyUseMixin(models.Model):
    waterbody_use = models.ForeignKey(WaterbodyUseCode, on_delete=models.PROTECT)

    class Meta:
        abstract = True


class WaterbodyUse(WaterbodyUseMixin, RepeatedFormData):

    class Meta:
        db_table = '"activity"."water_use"'


class DraftWaterbodyUse(WaterbodyUseMixin, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."water_use"'


###
# Waterbody Adjacent Use
###
class WaterbodyAdjacentLandUseMixin(models.Model):
    waterbody_adjacent_land_use = models.ForeignKey(
        AdjacentLandUseCode, on_delete=models.PROTECT
    )

    class Meta:
        abstract = True


class WaterbodyAdjacentLandUse(WaterbodyAdjacentLandUseMixin, RepeatedFormData):
    class Meta:
        db_table = '"activity"."water_adjacent_land_use"'


class DraftWaterbodyAdjacentLandUse(
    WaterbodyAdjacentLandUseMixin,
    DraftRepeatedFormData,
):
    class Meta:
        db_table = '"draft_activity"."water_adjacent_land_use"'
