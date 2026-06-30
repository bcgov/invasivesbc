from django.db import models

from api.models.codes import WaterbodySubstrateCode
from api.models.activity import RepeatedFormData, DraftRepeatedFormData


class BaseModel(models.Model):
    substrate_type = models.ForeignKey(WaterbodySubstrateCode, on_delete=models.PROTECT)

    class Meta:
        abstract = True


class WaterbodySubstrateType(BaseModel, RepeatedFormData):
    class Meta:
        db_table = '"activity"."waterbody_substrate"'


class DraftWaterbodySubstrateType(BaseModel, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."waterbody_substrate"'
