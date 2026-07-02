from django.db import models
from api.models.activity import UnrepeatedFormData, DraftUnrepeatedFormData
from api.models.enums import YesNoUnknown


class BaseModel(models.Model):
    suitable_for_biocontrol = models.CharField(
        choices=YesNoUnknown,
    )

    class Meta:
        abstract = True


class AquaticPlantObservationContext(BaseModel, UnrepeatedFormData):
    class Meta:
        db_table = '"activity"."observation_context_pa"'


class DraftAquaticPlantObservationContext(BaseModel, DraftUnrepeatedFormData):
    suitable_for_biocontrol = models.CharField(
        choices=YesNoUnknown,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"draft_activity"."observation_context_pa"'
