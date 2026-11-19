from django.db import models
from api.models.codes import BiocontrolAgentCode


class RestrictedBiocontrol(models.Model):
    agent = models.OneToOneField(
        BiocontrolAgentCode, primary_key=True, on_delete=models.CASCADE
    )

    class Meta:
        db_table = '"codes"."restricted_biocontrol"'
        db_table_comment = (
            "Biocontrol agents that are restricted to users with Biocontrol role"
        )
