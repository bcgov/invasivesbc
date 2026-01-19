from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable


class RisoArea(BaseOneToManyActivityTable):
    """
    Regional Invasive Species Organization (RISO) areas
    Non-User submitted Field. Generated after an activity submission based on latest geo data
    One Geolocation may be contained by overlapping RISO areas
    """

    organization = models.CharField(max_length=62, db_index=True)

    class Meta:
        db_table = '"activity"."riso_area"'
        db_table_comment = "Regional Invasive Species Organization (RISO) areas"
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "organization"],
                name="unique_activity_riso_organization",
            )
        ]

    def __str__(self):
        return f"{self.activity.short_id}: {self.organization}"
