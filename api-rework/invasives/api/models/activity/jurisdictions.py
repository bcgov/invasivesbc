from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from api.models.codes import JurisdictionCode
from django.core.validators import MaxValueValidator, MinValueValidator


class Jurisdiction(BaseOneToManyActivityTable):
    jurisdiction = models.ForeignKey(JurisdictionCode, on_delete=models.PROTECT)
    percent_covered = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100), MinValueValidator(1)]
    )

    class Meta:
        db_table = '"activity"."jurisdiction"'
        db_table_comment = "Jurisdiction where the activity was conducted."
        constraints = [
            models.UniqueConstraint(
                fields=["activity_id", "jurisdiction"],
                name="unique_activity_jurisdiction",
            )
        ]

    def __str__(self):
        return f"{self.activity_id.short_id}: {self.jurisdiction}"
