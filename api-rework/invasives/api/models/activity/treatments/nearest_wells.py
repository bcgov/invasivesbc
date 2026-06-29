from django.db import models

from api.models.activity import RepeatedFormData, DraftRepeatedFormData


class WellEntryMixin(models.Model):
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
        abstract = True


class WellEntry(WellEntryMixin, RepeatedFormData):
    class Meta:
        db_table = '"activity"."well_entries"'


class DraftWellEntry(WellEntryMixin, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."well_entries"'
