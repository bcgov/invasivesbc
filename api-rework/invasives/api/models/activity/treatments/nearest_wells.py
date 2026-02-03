from django.db import models

from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable


class WellEntry(BaseOneToManyActivityTable):
    """
    Identifier for Registered wells in proximity of a Chemical Treatment Site.
    Distance is based on the Centroid value of the Activity shape
    """

    well_tag_number = models.PositiveIntegerField(
        db_comment="Identifier of a Registered Well"
    )
    distance = models.PositiveIntegerField(
        db_comment="Distance from centroid of activity"
    )

    class Meta:
        db_table = '"activity"."well_entries"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "well_tag_number"],
                name="unique_well_in_activity",
            )
        ]

    def __str__(self):
        return f"{self.activity.short_id}: {self.distance}m ID: {self.well_tag_number}"
