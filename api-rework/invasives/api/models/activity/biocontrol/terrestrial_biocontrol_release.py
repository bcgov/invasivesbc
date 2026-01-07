from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from api.models_public.codes import BiocontrolAgentCode, TerrestrialPlantCode
from api.models_public.enums import YesNoUnknown


class TerrestrialBiocontrolRelease(BaseOneToManyActivityTable):
    """
    1:M Details for Biocontrol Releases
    consumed by:
      - Biocontrol Release
    """

    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)
    biocontrol_agent = models.ForeignKey(BiocontrolAgentCode, on_delete=models.PROTECT)
    linear_segment = models.CharField(choices=YesNoUnknown)
    mortality = models.PositiveSmallIntegerField()
    agent_source = models.CharField(max_length=256)
    collection_date = models.DateTimeField()
    plant_collected_from = models.ForeignKey(
        TerrestrialPlantCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="additional_plant_found_on",
    )
    plant_collected_from_manual = models.CharField(
        max_length=128, blank=True, null=True
    )

    class Meta:
        db_table = '"activity"."terrestrial_biocontrol_release"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity_id", "invasive_plant", "biocontrol_agent"],
                name="unique_biocontrol_release",
            )
        ]

    def clean(self):
        super().clean()
        if self.collection_date > timezone.now():
            raise ValidationError(
                {
                    "start_time_collecting": "Start time for collection cannot occur in the future"
                }
            )
