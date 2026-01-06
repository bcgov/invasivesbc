from django.core.exceptions import ValidationError
from django.db import models
from api.models.activity.activity_basic import ActivityBasic
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable


class LinkedRecord(BaseOneToManyActivityTable):
    activity_id = models.ForeignKey(
        ActivityBasic, on_delete=models.CASCADE, related_name="links_from"
    )
    linked_id = models.ForeignKey(
        ActivityBasic, on_delete=models.PROTECT, related_name="links_to"
    )

    class Meta:
        db_table = '"activity"."linked_record"'
        ordering = ["activity_id"]
        constraints = [
            models.UniqueConstraint(
                fields=["activity_id", "linked_id"], name="duplicate_record_linked"
            )
        ]
        db_table_comment = (
            "Records linked to another related record e.g. Monitoring to Treatment"
        )

    def clean(self):
        super().clean()
        if self.activity_id.pk == self.linked_id.pk:
            raise ValidationError(
                {
                    "activity_id": "activity_id cannot link to itself",
                    "linked_id": "linked_id cannot link to itself",
                }
            )

    def __str__(self):
        return f"Link: {self.activity_id.short_id} -> {self.linked_id.short_id}"
