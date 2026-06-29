from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes.code_tables import BiocontrolAgentCode, PlantsWithBiocontrol
from api.models.enums.yes_no_unknown import YesNoUnknown


class TerrestrialBiocontrolReleaseEntryMixin(models.Model):
    """
    1:M Details for Biocontrol Releases
    consumed by:
      - Biocontrol Release
    """

    invasive_plant = models.ForeignKey(PlantsWithBiocontrol, on_delete=models.PROTECT)
    biocontrol_agent = models.ForeignKey(BiocontrolAgentCode, on_delete=models.PROTECT)
    linear_segment = models.CharField(choices=YesNoUnknown)
    mortality = models.PositiveSmallIntegerField()
    agent_source = models.CharField(max_length=16384)
    collection_date = models.DateTimeField(null=True, blank=True)
    plant_collected_from = models.ForeignKey(
        PlantsWithBiocontrol,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="additional_plant_found_on",
    )
    plant_collected_from_manual = models.CharField(
        max_length=16384, blank=True, null=True
    )

    class Meta:
        abstract = True


class TerrestrialBiocontrolReleaseEntry(
    TerrestrialBiocontrolReleaseEntryMixin,
    RepeatedFormData,
):

    class Meta:
        db_table = '"activity"."biocontrol_release_pt"'

    def clean(self):
        super().clean()
        if self.collection_date is not None and self.collection_date > timezone.now():
            raise ValidationError(
                {
                    "start_time_collecting": "Start time for collection cannot occur in the future"
                }
            )


class DraftTerrestrialBiocontrolReleaseEntry(
    TerrestrialBiocontrolReleaseEntryMixin,
    DraftRepeatedFormData,
):
    invasive_plant = models.ForeignKey(
        PlantsWithBiocontrol,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    biocontrol_agent = models.ForeignKey(
        BiocontrolAgentCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    linear_segment = models.CharField(choices=YesNoUnknown, blank=True, null=True)
    mortality = models.PositiveSmallIntegerField(blank=True, null=True)
    agent_source = models.CharField(max_length=16384, blank=True, null=True)
    plant_collected_from = models.ForeignKey(
        PlantsWithBiocontrol,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="draft_additional_plant_found_on",
    )

    class Meta:
        db_table = '"draft_activity"."biocontrol_release_pt"'
