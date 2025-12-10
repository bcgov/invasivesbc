from django.db import models
from .activity_basic import ActivityBasic
from ..codes import EmployerCode

class Employer(models.Model):
  activity_id = models.ForeignKey(
    ActivityBasic,
    on_delete=models.CASCADE
  )
  employer = models.ForeignKey(EmployerCode, blank=False, on_delete=models.PROTECT)

  class Meta:
    db_table_comment="Employer of the person filling out the activity form."
    unique_together=[["activity_id", "employer"]]

  def __str__(self):
    return f"{self.activity_id.short_id}: {self.employer.full}"
