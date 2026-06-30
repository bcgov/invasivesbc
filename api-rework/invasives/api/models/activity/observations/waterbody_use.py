from django.db import models
from api.models.codes.code_tables import WaterbodyUseCode
from api.models.activity import RepeatedFormData, DraftRepeatedFormData


class BaseModel(models.Model):
    waterbody_use = models.ForeignKey(WaterbodyUseCode, on_delete=models.PROTECT)

    class Meta:
        abstract = True


class WaterbodyUse(BaseModel, RepeatedFormData):

    class Meta:
        db_table = '"activity"."water_use"'


class DraftWaterbodyUse(BaseModel, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."water_use"'
