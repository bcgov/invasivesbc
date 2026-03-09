from django.db import models

from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable


class WellEntry(BaseOneToManyActivityTable):
    """
    Identifier for Registered wells in proximity of a Chemical Treatment Site.
    Distance is based on the Centroid value of the Activity shape
    """

    well_tag = models.CharField(
        max_length=256,
        null=False,
        blank=False,
        default="Unset",  # to appease Django migrations. There should not be any rows in the database with this value.
        db_comment="Identifier of a Registered Well",
    )
    distance = models.PositiveIntegerField(
        db_comment="Distance from centroid of activity"
    )

    class Meta:
        db_table = '"activity"."well_entries"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "well_tag"],
                name="unique_well_tag_for_activity",
            )
        ]

    def __str__(self):
        return f"{self.activity.short_id}: {self.distance}m ID: {self.well_tag_number}"
