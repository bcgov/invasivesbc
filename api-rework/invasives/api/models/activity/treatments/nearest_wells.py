from django.db import models

from api.models.activity import RepeatedFormData


class WellEntry(RepeatedFormData):
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
