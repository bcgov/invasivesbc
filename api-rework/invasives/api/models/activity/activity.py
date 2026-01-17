import datetime
import uuid

from django.core.exceptions import ValidationError
from django.db import models

from api.models.activity.activity_subtypes import ActivitySubtypes
from api.models.enums.activity_type import ActivityType
from api.models.enums.form_status import FormStatus
from api.models.mixins.batch import BatchInformation
from api.models.mixins.geometry import Geometry
from api.models.mixins.platform import Platform
from api.models.mixins.regional_detail import ComputedLocationFields

UUID_SUBSTRING_LENGTH = 8


class Activity(
    ComputedLocationFields, Geometry, BatchInformation, Platform, models.Model
):
    """
    Base Model for all form types.
    consumed by:
      - All IBC Activities
    """

    activity_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    short_id = models.CharField(
        max_length=16, db_comment="User Readable formatted ID", editable=False
    )
    activity_type = models.CharField(choices=ActivityType, db_index=True)
    activity_subtype = models.CharField(
        choices=[(member.name, member.name) for member in ActivitySubtypes]
    )

    activity_date = models.DateField(db_index=True)
    created_by = models.CharField(max_length=64, db_index=True)
    form_status = models.CharField(
        max_length=16, choices=FormStatus, default=FormStatus.Draft, db_index=True
    )
    access_description = models.TextField(
        max_length=1024,
        db_comment="User directions to access location",
        blank=True,
        null=True,
    )
    comment = models.TextField(max_length=1024, blank=True, null=True)
    created_timestamp = models.DateTimeField(auto_now_add=True)
    received_timestamp = models.DateTimeField(auto_now_add=True, editable=False)

    linked_activities = models.ManyToManyField("api.Activity")

    class Meta:
        db_table = '"activity"."activity"'
        db_table_comment = (
            "Base fields for an activity. All records contain this information"
        )
        ordering = ["activity_date", "received_timestamp"]
        indexes = [
            models.Index(
                fields=["activity_type", "activity_date"],
                name="activity_basic_date_type_idx",
            ),
            models.Index(
                fields=["activity_subtype", "activity_date"],
                name="activity_basic_date_sub_idx",
            ),
        ]

    def __str__(self):
        return self.short_id

    def clean(self):
        super().clean()
        for other in self.linked_ids.all():
            if other.activity_id == self.activity_id:
                raise ValidationError(
                    {"linked_activities": "activity cannot link to itself"}
                )

    def save(self, *args, **kwargs):
        """
        For new records, Mutate the activity ID into the ShortID For a record
        """
        if not self.short_id:  # Create new ShortID
            subtype = ActivitySubtypes[self.activity_subtype].short_id_format
            uuid_substr = str(self.activity_id)[
                :UUID_SUBSTRING_LENGTH
            ].upper()  # 21bAcd -> 21BACD
            year = datetime.datetime.now().strftime("%y")
            ## Assign formatted short_id
            self.short_id = f"{year}{subtype}{uuid_substr}"

        super().save(*args, **kwargs)
