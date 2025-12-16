from django.db import models
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from invasivesbc.db_models.codes import MesoslopePositionCode, SiteSurfaceShapeCode

class MicrositeCondition(BaseOneToOneActivityTable):
  """
    Microsite Condition details for activities,
    consumed by:
      - Biocontrol Collection
      - Biocontrol Release Monitoring
      - Biocontrol Dispersal Monitoring
      - Biocontrol Release
  """
  mesoslope_position = models.ForeignKey(MesoslopePositionCode, on_delete=models.PROTECT)
  site_surface_shape = models.ForeignKey(SiteSurfaceShapeCode, on_delete=models.PROTECT)

  class Meta:
    # db_table='"activity"."microsite_conditions"'
    pass
