from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from api.models.enums import YesNoUnknown


class AquaticPlantObservationContext(BaseOneToOneActivityTable):
    suitable_for_biocontrol = models.CharField(
        choices=YesNoUnknown,
    )

    class Meta:
        db_table = '"activity"."observation_context_pa"'
