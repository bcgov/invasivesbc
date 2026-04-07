from django.db import models

from api.models.activity import RepeatedFormData
from api.models.codes import SpecificUseCode


class SpecificUse(RepeatedFormData):
    specific_use = models.ForeignKey(
        SpecificUseCode, on_delete=models.PROTECT, null=True
    )

    class Meta:
        db_table = '"activity"."specific_use"'
