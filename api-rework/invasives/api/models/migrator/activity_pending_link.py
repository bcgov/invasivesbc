from django.db import models


class ActivityPendingLink(models.Model):
    from_activity_id = models.TextField(
        blank=False, null=False
    )  # NOT an FK because links are imported separately from activities (which may not exist). integrity is confirmed later.

    to_activity_id = models.TextField(
        blank=False, null=False
    )  # NOT an FK because links are imported separately from activities (which may not exist). integrity is confirmed later.

    actioned = models.BooleanField(blank=False, null=False, default=False)
    success = models.BooleanField(blank=False, null=True, default=None)

    class Meta:
        db_table = '"etl"."pending_link"'
