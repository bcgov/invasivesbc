from django.db import models
from api.models.activity import RepeatedFormData
from api.models.codes.code_tables import JurisdictionCode
from django.core.validators import MaxValueValidator, MinValueValidator


class Jurisdiction(RepeatedFormData):
    jurisdiction = models.ForeignKey(JurisdictionCode, on_delete=models.PROTECT)
    percent_covered = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100), MinValueValidator(1)]
    )

    class Meta:
        db_table = '"activity"."jurisdiction"'
        db_table_comment = "Jurisdiction where the activity was conducted."
