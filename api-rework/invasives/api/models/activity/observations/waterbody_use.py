from django.db import models
from api.models_public.codes import WaterbodyUseCode, AdjacentLandUseCode
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable


class WaterbodyUse(BaseOneToManyActivityTable):
    waterbody_use = models.ForeignKey(WaterbodyUseCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."waterbody_use"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity_id", "waterbody_use"],
                name="waterbody_use_activity_waterbody_use",
            )
        ]


class WaterbodyAdjacentLandUse(BaseOneToManyActivityTable):
    waterbody_adjacent_land_use = models.ForeignKey(
        AdjacentLandUseCode, on_delete=models.PROTECT
    )

    class Meta:
        db_table = '"activity"."waterbody_adjacent_land_use"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity_id", "waterbody_adjacent_land_use"],
                name="adjacent_land_use_activity_id",
            )
        ]
