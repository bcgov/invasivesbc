from django.db import models

from api.models.activity import BaseOneToManyActivityTable
from api.models.codes import SpecificUseCode


class SpecificUse(BaseOneToManyActivityTable):
    specific_use = models.ForeignKey(
        SpecificUseCode, on_delete=models.PROTECT, null=True
    )

    class Meta:
        db_table = '"activity"."specific_use"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "specific_use"],
                name="unique_activity_specific_use",
            )
        ]
