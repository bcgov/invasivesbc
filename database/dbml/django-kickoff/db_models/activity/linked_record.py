from django.core.exceptions import ValidationError
from django.db import models
from ..activity import ActivityBasic

class LinkedRecord(models.Model):
  activity_id = models.ForeignKey(
    ActivityBasic,
    blank=False,
    on_delete=models.CASCADE,
    related_name="links_from"
  )
  linked_id = models.ForeignKey(ActivityBasic, blank=False, on_delete=models.PROTECT, related_name="links_to")

  class Meta:
    ordering=["activity_id"]
    unique_together=[["linked_id", "activity_id"]]
    db_table_comment="Records linked to another related record e.g. Monitoring to Treatment"

  def clean(self):
    if self.activity_id.pk == self.linked_id.pk:
      raise ValidationError({
        "activity_id": "activity_id cannot link to itself",
        "linked_id": "linked_id cannot link to itself"
      })

  def __str__(self):
    return f"Link: {self.activity_id.short_id} -> {self.linked_id.short_id}"
