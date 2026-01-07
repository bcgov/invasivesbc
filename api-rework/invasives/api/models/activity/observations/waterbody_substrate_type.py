from django.db import models
from api.models.codes.code_tables import SubstrateCode
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable


class WaterbodySubstrateType(BaseOneToManyActivityTable):
    substrate_type = models.ForeignKey(SubstrateCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."waterbody_substrate_level"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity_id", "substrate_type"],
                name="unique_activity_waterbody_substrate_level",
            )
        ]
