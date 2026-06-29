from django.db import models
from api.models.activity import UnrepeatedFormData, DraftUnrepeatedFormData
from api.models.enums import YesNoUnknown


class AquaticPlantObservationContextMixin(models.Model):
    suitable_for_biocontrol = models.CharField(
        choices=YesNoUnknown,
    )

    class Meta:
        abstract = True


class AquaticPlantObservationContext(
    AquaticPlantObservationContextMixin,
    UnrepeatedFormData,
):
    class Meta:
        db_table = '"activity"."observation_context_pa"'


class DraftAquaticPlantObservationContext(
    AquaticPlantObservationContextMixin,
    DraftUnrepeatedFormData,
):
    suitable_for_biocontrol = models.CharField(
        choices=YesNoUnknown,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"draft_activity"."observation_context_pa"'
