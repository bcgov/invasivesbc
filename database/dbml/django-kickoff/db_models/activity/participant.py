from django.db import models
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToManyActivityTable

class Participant(BaseOneToManyActivityTable):
  name = models.CharField(max_length=64)
  pac_number = models.CharField(
    max_length=64,
    blank=True,
    null=True,
    db_column="Pesticide Application Number (if applicable)"
  )

  class Meta:
    # db_table='"activity"."participant"'
    db_table_comment="A Participant is any individual who participated in an activity. They may not be an app user"
    ordering=["activity_id"]

  def __str__(self):
    if self.pac_number is None:
      return f"{self.activity_id.activity_subtype}: {self.name}"
    return f"{self.activity_id.activity_subtype}: {self.name}, PAC: {self.pac_number}"
