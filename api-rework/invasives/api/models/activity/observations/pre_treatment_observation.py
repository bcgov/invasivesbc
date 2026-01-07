from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from api.models_public.enums import YesNoUnknown


class PretreatmentObservation(BaseOneToOneActivityTable):
    """
    consumed by:
      - Terrestrial Invasive Plant Observation
      - Aquatic Invasive Plant Observation
    """

    pre_treatment_observation = models.CharField(choices=YesNoUnknown)

    class Meta:
        db_table = '"activity"."pre_treatment_observation"'
        db_table_comment = "Detail that an Observation has taken place before any known Treatments have occured"
        pass

    def __str__(self):
        return f"{self.activity_basic.short_id}: Pretreatment Status {self.pre_treatment_observation}"
