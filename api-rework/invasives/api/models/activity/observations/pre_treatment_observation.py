from django.db import models
from api.models.activity import UnrepeatedFormData
from api.models.enums.yes_no_unknown import YesNoUnknown


class PretreatmentObservation(UnrepeatedFormData):
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
