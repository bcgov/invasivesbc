from django.db import models
from api.models.activity import RepeatedFormData
from api.models.codes.code_tables import MesoslopePositionCode, SiteSurfaceShapeCode


class MicrositeCondition(RepeatedFormData):
    """
    Microsite Condition details for activities,
    consumed by:
      - Biocontrol Collection
      - Biocontrol Release Monitoring
      - Biocontrol Dispersal Monitoring
      - Biocontrol Release
    """

    mesoslope_position = models.ForeignKey(
        MesoslopePositionCode, on_delete=models.PROTECT, blank=True, null=True
    )
    site_surface_shape = models.ForeignKey(
        SiteSurfaceShapeCode, on_delete=models.PROTECT, blank=True, null=True
    )

    class Meta:
        db_table = '"activity"."microsite_conditions"'
        pass
