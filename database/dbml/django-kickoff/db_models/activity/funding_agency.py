from django.db import models
from .activity_basic import ActivityBasic
from ..codes import FundingAgencyCode

class FundingAgency(models.Model):
  activity_id = models.ForeignKey(
    ActivityBasic,
    on_delete=models.CASCADE
  )
  agency = models.ForeignKey(FundingAgencyCode, blank=False, on_delete=models.PROTECT)

  class Meta:
    db_table_comment="Agencies funding the activity."
    unique_together=[["activity_id", "agency"]]

  def __str__(self):
    return f"{self.activity_id.short_id}, Funded by: {self.agency}"
