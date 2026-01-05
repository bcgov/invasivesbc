from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable

class UploadedImage(BaseOneToManyActivityTable):
  """
  Details for User Uploaded Photos
  """
  file_name = models.CharField(max_length=256, db_comment="Image file name, required for S3 fetching")
  description = models.CharField(max_length=256, db_comment="User submitted details for an image. Generally an image title")

  class Meta:
    # db_table='"activity"."platform"'
    db_table_comment="Image uploads for IBC Records"

  def __str__(self):
    return f"{self.activity_id.short_id}: {self.description}"
