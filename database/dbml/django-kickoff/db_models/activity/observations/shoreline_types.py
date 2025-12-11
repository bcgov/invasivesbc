from django.db import models
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from invasivesbc.db_models.codes import ShorelineTypeCode
from django.core.validators import MaxValueValidator, MinValueValidator


class ShorelineTypes(BaseOneToOneActivityTable):
  shoreline_type = models.ForeignKey(ShorelineTypeCode, on_delete=models.PROTECT)
  percent_covered = models.PositiveSmallIntegerField(
    validators=[MinValueValidator(1),MaxValueValidator(100)]
  )

  class Meta:
    # db_table='"activity"."shoreline_types"'
    constraints = [
      models.UniqueConstraint(fields=["activity_id", "shoreline_type"], name="unique_activity_shoreline")
    ]
    db_table_comment="Details of surrounding area for a terrestrial activity."
