from django.db import models
from django.core.validators import MaxValueValidator
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from invasivesbc.db_models.codes import MesoslopePositionCode, SiteSurfaceShapeCode

class SpreadResults(BaseOneToOneActivityTable):
  """
    Spread Result Condition details for activities,
    used by:
      - Biocontrol Release Monitoring
  """
  agent_density = models.PositiveSmallIntegerField(validators=[MaxValueValidator(100)])
  plant_attack = models.PositiveSmallIntegerField(validators=[MaxValueValidator(100)])
  max_spread_distance_m = models.PositiveIntegerField()
  max_spread_aspect_deg = models.PositiveSmallIntegerField(validators=[MaxValueValidator(360)])

  class Meta:
    # db_table='"activity"."spread_results"'
    pass
