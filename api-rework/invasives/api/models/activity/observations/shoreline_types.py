from django.db import models
from api.models.activity import RepeatedFormData
from api.models.codes.code_tables import ShorelineTypeCode
from django.core.validators import MaxValueValidator, MinValueValidator


class ShorelineTypes(RepeatedFormData):
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
        db_table = '"activity"."shoreline_types"'
        db_table_comment = "Details of surrounding area for a terrestrial activity."
