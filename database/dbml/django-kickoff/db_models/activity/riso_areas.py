from django.db import models
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToManyActivityTable

class RisoArea(BaseOneToManyActivityTable):
  organization = models.CharField(max_length=62, db_index=True)

  class Meta:
    # db_table='"activity"."riso_area"'
    db_table_comment="Regional Invasive Species Organization (RISO) areas"
    constraints = [
      models.UniqueConstraint(fields=["activity_id", "organization"], name="unique_activity_riso_organization")
    ]

  def __str__(self):
    return f"{self.activity_id.short_id}: {self.organization}"
