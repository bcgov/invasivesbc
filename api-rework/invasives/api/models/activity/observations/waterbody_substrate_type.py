from django.db import models

from api.models.codes import WaterbodySubstrateCode
from api.models.codes.code_tables import SubstrateCode
from api.models.activity import RepeatedFormData


class WaterbodySubstrateType(RepeatedFormData):
    substrate_type = models.ForeignKey(WaterbodySubstrateCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."waterbody_substrate"'
