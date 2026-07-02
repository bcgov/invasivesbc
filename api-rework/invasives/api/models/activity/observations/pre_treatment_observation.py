from django.db import models
from api.models.activity import UnrepeatedFormData, DraftUnrepeatedFormData
from api.models.enums.yes_no_unknown import YesNoUnknown


class BaseModel(models.Model):
    """
    consumed by:
      - Terrestrial Invasive Plant Observation
      - Aquatic Invasive Plant Observation
    """

    pre_treatment_observation = models.CharField(choices=YesNoUnknown)

    class Meta:
        abstract = True


class PretreatmentObservation(BaseModel, UnrepeatedFormData):
    class Meta:
        db_table = '"activity"."observation_pre_treatment_p"'
        db_table_comment = "Detail that an Observation has taken place before any known Treatments have occured"


class DraftPretreatmentObservation(BaseModel, DraftUnrepeatedFormData):

    pre_treatment_observation = models.CharField(
        choices=YesNoUnknown,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"draft_activity"."observation_pre_treatment_p"'
        db_table_comment = "Detail that an Observation has taken place before any known Treatments have occured"
