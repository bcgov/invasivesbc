from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from api.models.codes.code_tables import FundingAgencyCode


class FundingAgency(BaseOneToManyActivityTable):
    agency = models.ForeignKey(FundingAgencyCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."funding_agency"'
        db_table_comment = "Agencies funding the activity."
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "agency"], name="unique_activity_agency"
            )
        ]

    def __str__(self):
        return f"{self.activity.short_id}, Funded by: {self.agency}"
