from django.db import models
from .activity_basic import ActivityBasic

class ProjectCode(models.Model):
  activity_id = models.ForeignKey(
    ActivityBasic,
    on_delete=models.CASCADE
  )
  description = models.CharField(max_length=64, blank=False)

  class Meta:
    db_table_comment="Project codes can be created for a user to organize their records in a way meaningful to them"
    unique_together=[["activity_id", "description"]]

  def __str__(self):
    return f"{self.activity_id.short_id}: {self.description}"
