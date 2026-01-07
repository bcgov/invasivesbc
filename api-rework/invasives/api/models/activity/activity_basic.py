import datetime
import uuid

from django.db import models

from api.models.codes.code_tables import ActivitySubtypeCode
from api.models.enums.activity_type import ActivityType
from api.models.enums.form_status import FormStatus

UUID_SUBSTRING_LENGTH = 8


class ActivityBasic(models.Model):
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
    activity_subtype = models.ForeignKey(
        ActivitySubtypeCode, on_delete=models.RESTRICT, db_index=True
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

    class Meta:
        db_table = '"activity"."activity_basic"'
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

    def save(self, *args, **kwargs):
        """
        For new records, Mutate the activity ID into the ShortID For a record
        """
        if not self.short_id:  # Create new ShortID
            try:
                subtype = ActivitySubtypeCode.objects.get(
                    pk=self.activity_subtype
                ).short_id_format
                uuid_substr = str(self.activity_id)[
                    :UUID_SUBSTRING_LENGTH
                ].upper()  # 21bAcd -> 21BACD
                year = datetime.datetime.now().strftime("%y")
                ## Assign formatted short_id
                self.short_id = f"{year}{subtype}{uuid_substr}"
            except ActivitySubtypeCode.DoesNotExist:
                print(f"Subtype not found in database: {self.activity_subtype}")
                raise ActivitySubtypeCode.DoesNotExist
        super().save(*args, **kwargs)
