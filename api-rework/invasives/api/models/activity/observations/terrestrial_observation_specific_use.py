from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from api.models.codes.code_tables import SpecificUseCode


class TerrestrialObservationSpecificUse(BaseOneToManyActivityTable):
    """
    Specific use for a Terrestrial Plant Observation.
    One observation may contain multiple uses.

    section: Observation Plant Terrestrial Information
    consumed by:
      - Terrestrial Invasive Plant Observation
    """

    specific_use = models.ForeignKey(SpecificUseCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."terrestrial_plant_specific_use"'
        db_table_comment = "Notable land uses or attributed within the observation area"

    def __str__(self):
        return f"{self.activity_id.short_id}: {self.specific_use}"
