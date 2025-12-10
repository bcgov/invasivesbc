from django.db import models
from .activity_basic import ActivityBasic

class Participant(models.Model):
  activity_id = models.ForeignKey(
    ActivityBasic,
    on_delete=models.CASCADE
  )
  name = models.CharField(max_length=64, blank=False)
  pac_number = models.CharField(max_length=64, blank=True)

  class Meta:
    db_table_comment="A Participant is any individual who participates in an activity. They may not be an app user"
    ordering=["activity_id"]

  def __str__(self):
    if self.pac_number is None:
      return f"{self.activity_id.activity_subtype}: {self.name}"
    return f"{self.activity_id.activity_subtype}: {self.name} PAC: {self.pac_number}"
