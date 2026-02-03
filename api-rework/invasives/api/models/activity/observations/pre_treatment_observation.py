from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from api.models.enums.yes_no_unknown import YesNoUnknown


class PretreatmentObservation(BaseOneToOneActivityTable):
    """
    consumed by:
      - Terrestrial Invasive Plant Observation
      - Aquatic Invasive Plant Observation
    """

    pre_treatment_observation = models.CharField(choices=YesNoUnknown)

    class Meta:
        db_table = '"activity"."observation_pre_treatment_p"'
        db_table_comment = "Detail that an Observation has taken place before any known Treatments have occured"
        pass

    def __str__(self):
        return f"{self.activity.short_id}: Pretreatment Status {self.pre_treatment_observation}"
