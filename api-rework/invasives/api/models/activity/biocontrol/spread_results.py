from django.core.validators import MaxValueValidator
from django.db import models

from api.models.activity import UnrepeatedFormData


class SpreadResults(UnrepeatedFormData):
    """
    Spread Result Condition details for activities,
    consumed by:
      - Biocontrol Release Monitoring
    """

    agent_density = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100)], blank=True, null=True
    )
    plant_attack = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100)], blank=True, null=True
    )
    max_spread_distance_m = models.PositiveIntegerField(blank=True, null=True)
    max_spread_aspect_deg = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(360)], blank=True, null=True
    )

    class Meta:
        db_table = '"activity"."spread_results"'
        pass
