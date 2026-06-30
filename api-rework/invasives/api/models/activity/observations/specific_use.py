from django.db import models

from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes import SpecificUseCode


class BaseModel(models.Model):
    specific_use = models.ForeignKey(
        SpecificUseCode, on_delete=models.PROTECT, null=True
    )

    class Meta:
        abstract = True


class SpecificUse(BaseModel, RepeatedFormData):
    class Meta:
        db_table = '"activity"."specific_use"'


class DraftSpecificUse(BaseModel, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."specific_use"'
