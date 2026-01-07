from django.db import models
from django.core.validators import MaxValueValidator
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable


class SpreadResults(BaseOneToOneActivityTable):
    """
    Spread Result Condition details for activities,
    consumed by:
      - Biocontrol Release Monitoring
    """

    agent_density = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100)]
    )
    plant_attack = models.PositiveSmallIntegerField(validators=[MaxValueValidator(100)])
    max_spread_distance_m = models.PositiveIntegerField()
    max_spread_aspect_deg = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(360)]
    )

    class Meta:
        db_table = '"activity"."spread_results"'
        pass
