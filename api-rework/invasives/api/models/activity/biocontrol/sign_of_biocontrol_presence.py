from django.db import models
from api.models.activity import RepeatedFormData
from api.models.codes import (
    BiocontrolPresenceCode,
    BiocontrolAgentCode,
    TerrestrialPlantCode,
)


class SignOfBiocontrolPresenceTerrestrial(RepeatedFormData):
    sign_of_presence = models.ForeignKey(
        BiocontrolPresenceCode, on_delete=models.PROTECT
    )

    class Meta:
        db_table = '"activity"."sign_of_bioagent_presence_pt"'
