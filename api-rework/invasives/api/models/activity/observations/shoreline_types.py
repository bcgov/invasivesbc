from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes.code_tables import ShorelineTypeCode
from django.core.validators import MaxValueValidator, MinValueValidator


class ShorelineTypesMixin(models.Model):
    """
    consumed by:
      - Aquatic Invasive Plant Observation
    """

    objects = models.Manager()

    shoreline_type = models.ForeignKey(ShorelineTypeCode, on_delete=models.PROTECT)
    percent_covered = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )

    class Meta:
        abstract = True


class ShorelineTypes(ShorelineTypesMixin, RepeatedFormData):
    class Meta:
        db_table = '"activity"."shoreline_types"'
        db_table_comment = "Details of surrounding area for a terrestrial activity."


class DraftShorelineTypes(DraftRepeatedFormData):
    shoreline_type = models.ForeignKey(
        ShorelineTypeCode, on_delete=models.PROTECT, blank=True, null=True
    )
    percent_covered = models.SmallIntegerField(blank=True, null=True)

    class Meta:
        db_table = '"draft_activity"."shoreline_types"'
        db_table_comment = "Details of surrounding area for a terrestrial activity."
