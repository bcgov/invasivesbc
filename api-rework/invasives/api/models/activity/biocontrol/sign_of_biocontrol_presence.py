from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes import (
    BiocontrolPresenceCode,
)


class BaseModel(models.Model):
    sign_of_presence = models.ForeignKey(
        BiocontrolPresenceCode, on_delete=models.PROTECT
    )

    class Meta:
        abstract = True


class SignOfBiocontrolPresenceTerrestrial(BaseModel, RepeatedFormData):

    class Meta:
        db_table = '"activity"."sign_of_bioagent_presence_pt"'


class DraftSignOfBiocontrolPresenceTerrestrial(BaseModel, DraftRepeatedFormData):

    class Meta:
        db_table = '"draft_activity"."sign_of_bioagent_presence_pt"'
