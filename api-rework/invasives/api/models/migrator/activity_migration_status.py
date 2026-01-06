from django.db import models


class ActivityMigrationStatus(models.Model):

    id = models.BigAutoField(primary_key=True)

    activity_id = models.TextField(
        blank=True, null=True
    )  # NOT an FK because we also report on invalid migrations (ie the target does not exist)

    extended_status = models.TextField(blank=True, null=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    success = models.BooleanField(default=False, null=False)

    class Meta:
        db_table = '"etl"."activity_migration_status"'
