from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes.code_tables import MesoslopePositionCode, SiteSurfaceShapeCode


class MicrositeMixin(models.Model):
    """
    Microsite Condition details for activities,
    consumed by:
      - Biocontrol Collection
      - Biocontrol Release Monitoring
      - Biocontrol Dispersal Monitoring
      - Biocontrol Release
    """

    mesoslope_position = models.ForeignKey(
        MesoslopePositionCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    site_surface_shape = models.ForeignKey(
        SiteSurfaceShapeCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    class Meta:
        abstract = True


class MicrositeCondition(MicrositeMixin, RepeatedFormData):
    class Meta:
        db_table = '"activity"."microsite_conditions"'


class DraftMicrositeCondition(MicrositeMixin, DraftRepeatedFormData):
    mesoslope_position = models.ForeignKey(
        MesoslopePositionCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    site_surface_shape = models.ForeignKey(
        SiteSurfaceShapeCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"draft_activity"."microsite_conditions"'
        pass
