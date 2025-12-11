from django.db import models
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from invasivesbc.db_models.codes import EmployerCode

class Employer(BaseOneToManyActivityTable):
  employer = models.ForeignKey(EmployerCode, on_delete=models.PROTECT)

  class Meta:
    # db_table='"activity"."employer"'
    db_table_comment="Employer of the person filling out the activity form."
    constraints = [
      models.UniqueConstraint(fields=["activity_id", "employer"], name="unique_employer_per_activity")
    ]

  def __str__(self):
    return f"{self.activity_id.short_id}: {self.employer.full}"
