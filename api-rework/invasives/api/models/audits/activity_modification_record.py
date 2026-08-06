from django.db import models, transaction
from api.models.activity import Activity
from api.models.auth import User
from api.models.enums import PlatformSource


class ActivityModificationRecord(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_comment="User who initiated the change",
    )
    version = models.PositiveIntegerField(
        editable=False,
        db_comment="Current version number of record",
    )

    activity = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
    )
    date = models.DateTimeField(
        auto_now_add=True,
        db_comment="Date change occured",
    )
    platform = models.CharField(
        choices=PlatformSource,
    )
    diff = models.JSONField(
        db_comment="Total changes between the previous version and the newest version"
    )

    class Meta:
        db_table = '"activity"."modification_record"'
        db_table_comment = "Represents updates to a given activity record"
        unique_together = ("version", "activity_id")

    def save(self, *args, **kwargs):
        if not self.pk:
            with transaction.atomic():
                last_number = ActivityModificationRecord.objects.filter(
                    activity=self.activity
                ).aggregate(max_num=models.Max("version"))["max_num"]
                self.version = (last_number or 1) + 1

        super().save(*args, **kwargs)
