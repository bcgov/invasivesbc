from django.db import models
from api.models.activity import BaseOneToManyActivityTable
from api.models.codes import (
    BiocontrolPresenceCode,
    BiocontrolAgentCode,
    TerrestrialPlantCode,
)


class SignOfBiocontrolPresenceTerrestrial(BaseOneToManyActivityTable):
    sign_of_presence = models.ForeignKey(
        BiocontrolPresenceCode, on_delete=models.PROTECT
    )
    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)
    biocontrol_agent = models.ForeignKey(BiocontrolAgentCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."sign_of_biocontrol_presence_terrestrial"'
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "sign_of_presence",
                    "invasive_plant",
                    "biocontrol_agent",
                    "activity",
                ],
                name="unique_sign_of_biocontrol_presence",
            )
        ]
