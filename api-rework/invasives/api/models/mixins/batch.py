from django.db import models


class BatchInformation(models.Model):
    """
    Represents a single row-level association between an uploaded batch record to an activity record.
    Non-User submitted fields. Entered as part of the batch upload process.
    """

    batch_id = models.PositiveBigIntegerField(null=True, default=None, blank=True)
    batch_row_id = models.PositiveBigIntegerField(
        db_comment="Row on uploaded document", null=True, default=None, blank=True
    )

    class Meta:
        abstract = True
        constraints = [
            models.UniqueConstraint(
                fields=["batch_id", "row_id"],
                name="unique_activity_batchid_row",
            )
        ]
        indexes = [models.Index(fields=["batch_id"], name="batch_id_idx")]
