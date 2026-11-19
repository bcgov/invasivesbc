from django.db import models
from api.models.codes import BiocontrolAgentCode, PlantsWithBiocontrol


class BiocontrolHostAssociation(models.Model):
    pk = models.CompositePrimaryKey("agent", "plant", primary_key=True)
    agent = models.ForeignKey(BiocontrolAgentCode, on_delete=models.CASCADE)
    plant = models.ForeignKey(PlantsWithBiocontrol, on_delete=models.CASCADE)

    class Meta:
        db_table = '"codes"."biocontrol_host_association"'
        db_table_comment = "Biocontrol Agents paired with the plants they treat"
