from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable

class BatchDetail(BaseOneToOneActivityTable):
  """
    Represents a single row-level association between an uploaded batch record to an activity record.
    Non-User submitted fields. Entered as part of the batch upload process.
  """
  batch_id = models.PositiveBigIntegerField()
  row_id = models.PositiveBigIntegerField(db_comment="Row on uploaded document")

  class Meta:
    # db_table='"activity"."batch_detail"'
    constraints = [
      models.UniqueConstraint(fields=["activity_id", "batch_id", "row_id"], name="unique_activity_batchid_row")
    ]
    db_table_comment="Linking batch uploads to their respective records"
    indexes = [
      models.Index(fields=["batch_id"], name="batch_id_idx")
    ]

  def __str__(self):
    return f"{self.activity_id.short_id}, Batch: {self.batch_id} Row: {self.row_id}"
