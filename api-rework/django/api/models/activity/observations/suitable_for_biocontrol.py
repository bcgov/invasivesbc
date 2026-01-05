from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from api.models.enums.yes_no_unknown import YesNoUnknown

class SuitableForBiocontrol(BaseOneToOneActivityTable):
  """
    consumed by:
      - Aquatic Invasive Plant Observation
      - Terrestrial Invasive Plant Observation
  """
  suitable_for_biocontrol = models.CharField(choices=YesNoUnknown, default=YesNoUnknown.Unknown)

  class Meta:
    # db_table='"activity"."suitable_for_biocontrol"'
    db_table_comment="Defines whether an activity is suitable for Biocontrol agent treatment"

  def __str__(self):
    return f"{self.activity_basic.short_id}: {self.suitable_for_biocontrol}"
