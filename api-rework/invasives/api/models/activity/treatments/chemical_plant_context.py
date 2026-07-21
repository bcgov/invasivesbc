from django.db import models
from api.models.codes.code_tables import (
    ChemicalPrecautionaryStatement,
    PestManagementPlan,
    WindDirectionCode,
)
from api.models.activity import UnrepeatedFormData, DraftUnrepeatedFormData
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from api.models.enums.yes_no_unknown import YesNoUnknown
from django.utils import timezone


class BaseModel(models.Model):
    pesticide_use_permit = models.CharField(max_length=128, blank=True, null=True)
    pest_management_plan = models.ForeignKey(
        PestManagementPlan, on_delete=models.PROTECT, blank=True, null=True
    )
    pest_management_plan_manual = models.CharField(
        max_length=128, blank=True, null=True
    )
    pesticide_employer_code = models.CharField(max_length=128, blank=True, null=True)

    # Ideal temperature should be between 10-28 degrees. But allow greater to catch non-compliance.
    # Prevent >= 100 to catch mistakes e.g. 10 -> 100 (from extra 0 press), etc.
    temperature_c = models.PositiveSmallIntegerField(validators=[MaxValueValidator(99)])
    wind_speed_kmh = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(99)]
    )
    application_start_time = models.DateTimeField()
    wind_direction = models.ForeignKey(WindDirectionCode, on_delete=models.PROTECT)

    humidity = models.SmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)], blank=True, null=True
    )
    treatment_notice_signs = models.CharField(choices=YesNoUnknown)
    precautionary_statement = models.ForeignKey(
        ChemicalPrecautionaryStatement, on_delete=models.PROTECT, null=True, blank=True
    )
    ntz_reduction = models.BooleanField()
    rationale_for_ntz_reduction = models.CharField(
        max_length=256, blank=True, null=True
    )
    additional_unmapped_well_water = models.BooleanField(
        db_comment="Additional or unmapped wells or water license intakes within 30m"
    )
    pest_injury_threshold_determination = models.BooleanField()

    class Meta:
        abstract = True


class ChemicalTreatmentContext(BaseModel, UnrepeatedFormData):
    class Meta:
        db_table = '"activity"."treatment_chemical_context"'

    def clean(self):
        super().clean()
        errors = {}
        if self.application_start_time and self.application_start_time > timezone.now():
            errors["application_start_time"] = (
                "Application start time cannot occur in the future."
            )
        if self.ntz_reduction and not self.rationale_for_ntz_reduction:
            errors["rationale_for_ntz_reduction"] = (
                "Rationale for NTZ reduction cannot be blank if NTZ Reduction is true"
            )
        elif not self.ntz_reduction and self.rationale_for_ntz_reduction:
            self.rationale_for_ntz_reduction = None

        if self.wind_speed_kmh > 0 and (
            self.wind_direction is None or self.wind_direction.code == "No Wind"
        ):
            errors["wind_direction"] = (
                "Must specify a wind direction when wind speed is > 0"
            )
        if errors:
            raise ValidationError(errors)


class DraftChemicalTreatmentContext(BaseModel, DraftUnrepeatedFormData):
    temperature_c = models.SmallIntegerField(blank=True, null=True)
    wind_speed_kmh = models.SmallIntegerField(blank=True, null=True)
    application_start_time = models.DateTimeField(blank=True, null=True)
    wind_direction = models.ForeignKey(
        WindDirectionCode, on_delete=models.PROTECT, blank=True, null=True
    )
    treatment_notice_signs = models.CharField(
        choices=YesNoUnknown, null=True, blank=True
    )
    precautionary_statement = models.ForeignKey(
        ChemicalPrecautionaryStatement, on_delete=models.PROTECT, null=True, blank=True
    )
    ntz_reduction = models.BooleanField(null=True, blank=True)
    rationale_for_ntz_reduction = models.CharField(
        max_length=256, blank=True, null=True
    )
    additional_unmapped_well_water = models.BooleanField(
        null=True,
        blank=True,
        db_comment="Additional or unmapped wells or water license intakes within 30m",
    )
    pest_injury_threshold_determination = models.BooleanField(null=True, blank=True)

    class Meta:
        db_table = '"draft_activity"."treatment_chemical_context"'
