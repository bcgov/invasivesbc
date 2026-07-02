from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes.code_tables import (
    AquaticPlantCode,
    EfficacyManagementRatingCode,
    TerrestrialPlantCode,
    TreatmentEfficacyRatingCode,
)
from api.models.enums.treatment_pass import TreatmentPass
from api.models.enums.yes_no import YesNo


class BaseModel(models.Model):
    """
    1:M Relationship between for an Activity. PlantMonitoringBase covers Chemical and Mechanical Treatment Monitoring
    Plant Monitoring Base covers the 1:M relationship to an Activity where Monitoring was from a
    past Mechanical or Chemical Treatment
    """

    invasive_plant = models.ForeignKey("PlantCodes", on_delete=models.PROTECT)
    evidence_of_treatment = models.CharField(choices=YesNo)
    treatment_efficacy_rating = models.ForeignKey(
        TreatmentEfficacyRatingCode, on_delete=models.PROTECT, null=True, blank=True
    )
    management_efficacy_rating = models.ForeignKey(
        EfficacyManagementRatingCode, on_delete=models.PROTECT
    )
    treatment_pass = models.CharField(choices=TreatmentPass, blank=True, null=True)
    comment = models.TextField(max_length=16384, blank=True, null=True)

    class Meta:
        abstract = True


class PlantMonitoringBase(BaseModel, RepeatedFormData):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def clean(self):
        super().clean()
        # temporarily disable this check due to non-conforming existing records
        # if (
        #     self.evidence_of_treatment == YesNo.Yes
        #     and self.treatment_efficacy_rating is None
        # ):
        #     error = "Must include treatment efficacy rating if evidence of treatment is 'Yes'"
        #     raise ValidationError(
        #         {"treatment_efficacy_rating": error, "evidence_of_treatment": error}
        #     )
        # elif (
        #     self.evidence_of_treatment == YesNo.No
        #     and self.treatment_efficacy_rating is not None
        # ):
        #     self.treatment_efficacy_rating = None


class TerrestrialTreatmentMonitoringEntry(PlantMonitoringBase):
    """
    Terrestrial Plant Specific Monitoring for Chemical / Mechanical treatments.
    """

    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."monitoring_treatment_entries_pt"'


class AquaticTreatmentMonitoringEntry(PlantMonitoringBase):
    """
    Aquatic Plant Specific Monitoring for Chemical / Mechanical treatments.
    """

    invasive_plant = models.ForeignKey(AquaticPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."monitoring_treatment_entries_pa"'


class DraftPlantMonitoringBase(BaseModel, DraftRepeatedFormData):
    invasive_plant = models.ForeignKey(
        "PlantCodes",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    evidence_of_treatment = models.CharField(
        choices=YesNo,
        blank=True,
        null=True,
    )

    management_efficacy_rating = models.ForeignKey(
        EfficacyManagementRatingCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    class Meta:
        abstract = True


class DraftTerrestrialTreatmentMonitoringEntry(DraftPlantMonitoringBase):
    """
    Terrestrial Plant Specific Monitoring for Chemical / Mechanical treatments.
    """

    invasive_plant = models.ForeignKey(
        TerrestrialPlantCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"draft_activity"."monitoring_treatment_entries_pt"'


class DraftAquaticTreatmentMonitoringEntry(DraftPlantMonitoringBase):
    """
    Aquatic Plant Specific Monitoring for Chemical / Mechanical treatments.
    """

    invasive_plant = models.ForeignKey(
        AquaticPlantCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"draft_activity"."monitoring_treatment_entries_pa"'
