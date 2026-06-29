from django.db import models

from api.models.activity import UnrepeatedFormData, DraftUnrepeatedFormData
from api.models.codes.code_tables import (
    AspectCode,
    SlopePercentCode,
    SoilTextureCode,
)
from api.models.enums.yes_no_unknown import YesNoUnknown


class TerrestrialPlantObservationContextMixin(models.Model):
    """
    consumed by:
      - Terrestrial Invasive Plant Observation
    """

    soil_texture = models.ForeignKey(
        SoilTextureCode,
        on_delete=models.PROTECT,
        null=True,
    )
    suitable_for_biocontrol_agent = models.CharField(
        choices=YesNoUnknown,
        default="Unknown",
    )

    research_observation = models.CharField(choices=YesNoUnknown, default="Unknown")
    aspect = models.ForeignKey(AspectCode, on_delete=models.PROTECT)
    visible_well_nearby = models.CharField(choices=YesNoUnknown, default="Unknown")
    slope_percent = models.ForeignKey(SlopePercentCode, on_delete=models.PROTECT)

    class Meta:
        abstract = True


class TerrestrialPlantObservationContext(
    TerrestrialPlantObservationContextMixin,
    UnrepeatedFormData,
):
    class Meta:
        db_table = '"activity"."observation_context_pt"'
        db_table_comment = "Details of surrounding area for a terrestrial activity."

    def clean(self):
        super().clean()

        # @TODO Link Flat Codes
        # if self.slope_percent == "SLOPE_FLAT_CODE" and self.aspect != "ASPECT_FLAT_CODE" \
        #   or self.slope_percent != "SLOPE_FLAT_CODE" and self.aspect == "ASPECT_FLAT_CODE":
        #   raise ValidationError({
        #     "slope_percent", "If either Aspect or Slope is flat, both of them must be flat.",
        #     "aspect", "If either Aspect or Slope is flat, both of them must be flat.",
        #   })


class DraftTerrestrialPlantObservationContext(
    TerrestrialPlantObservationContextMixin, DraftUnrepeatedFormData
):
    suitable_for_biocontrol_agent = models.CharField(
        choices=YesNoUnknown,
        default="Unknown",
        null=True,
        blank=True,
    )

    research_observation = models.CharField(
        choices=YesNoUnknown,
        default="Unknown",
        null=True,
        blank=True,
    )
    aspect = models.ForeignKey(
        AspectCode,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    visible_well_nearby = models.CharField(
        choices=YesNoUnknown,
        default="Unknown",
        null=True,
        blank=True,
    )
    slope_percent = models.ForeignKey(
        SlopePercentCode,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )

    class Meta:
        db_table = '"draft_activity"."observation_context_pt"'
        db_table_comment = "Details of surrounding area for a terrestrial activity."
