from django.db import models

from api.models.codes import WaterbodySubstrateCode
from api.models.codes.code_tables import SubstrateCode
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable


class WaterbodySubstrateType(BaseOneToManyActivityTable):
    substrate_type = models.ForeignKey(WaterbodySubstrateCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."waterbody_substrate"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "substrate_type"],
                name="unique_activity_waterbody_substrate",
            )
        ]
