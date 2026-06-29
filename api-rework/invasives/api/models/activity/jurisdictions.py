from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes.code_tables import JurisdictionCode
from django.core.validators import MaxValueValidator, MinValueValidator


class JurisdictionMixin(models.Model):
    jurisdiction = models.ForeignKey(JurisdictionCode, on_delete=models.PROTECT)
    percent_covered = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100), MinValueValidator(1)]
    )

    class Meta:
        abstract = True


class Jurisdiction(JurisdictionMixin, RepeatedFormData):

    class Meta:
        db_table = '"activity"."jurisdiction"'
        db_table_comment = "Jurisdiction where the activity was conducted."


class DraftJurisdiction(JurisdictionMixin, DraftRepeatedFormData):
    jurisdiction = models.ForeignKey(
        JurisdictionCode, on_delete=models.PROTECT, blank=True, null=True
    )
    percent_covered = models.SmallIntegerField(blank=True, null=True)

    class Meta:
        db_table = '"draft_activity"."jurisdiction"'
        db_table_comment = "Jurisdiction where the activity was conducted."
