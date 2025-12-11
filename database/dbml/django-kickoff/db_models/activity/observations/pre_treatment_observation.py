from django.db import models
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from invasivesbc.db_models.enums import YesNoUnknown

class PretreatmentObservation(BaseOneToOneActivityTable):
  pre_treatment_observation = models.CharField(choices=YesNoUnknown)

  class Meta:
    # db_table='"activity"."pre_treatment_observation"'
    pass

  def __str__(self):
    return f"{self.activity_basic.short_id}: Pretreatment Status {self.pre_treatment_observation}"
