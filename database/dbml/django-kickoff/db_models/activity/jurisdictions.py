from django.db import models
from .activity_basic import ActivityBasic
from ..codes import JurisdictionCode

class Jurisdiction(models.Model):
  activity_id = models.ForeignKey(
    ActivityBasic,
    on_delete=models.CASCADE
  )
  jurisdiction = models.ForeignKey(JurisdictionCode, blank=False, on_delete=models.PROTECT)

  class Meta:
    db_table_comment="Jurisdiction where the activity was conducted."
    unique_together=[["activity_id", "jurisdiction"]]

  def __str__(self):
    return f"{self.activity_id.short_id}: {self.jurisdiction}"
