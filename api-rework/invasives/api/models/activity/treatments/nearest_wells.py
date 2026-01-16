from django.db import models

from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable


class NearestWell(BaseOneToManyActivityTable):
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
        db_table = '"activity"."nearest_well"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity_id", "well_tag_number"],
                name="unique_well_in_activity",
            )
        ]
    def __str__(self):
        return (
            f"{self.activity_id.short_id}: {self.distance}m ID: {self.well_tag_number}"
        )
