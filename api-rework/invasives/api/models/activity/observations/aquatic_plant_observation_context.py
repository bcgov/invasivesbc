from django.db import models
from api.models.activity import UnrepeatedFormData
from api.models.enums import YesNoUnknown


class AquaticPlantObservationContext(UnrepeatedFormData):
    suitable_for_biocontrol = models.CharField(
        choices=YesNoUnknown,
    )

    class Meta:
        db_table = '"activity"."observation_context_pa"'
