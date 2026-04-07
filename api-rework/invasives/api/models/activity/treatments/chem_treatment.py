from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone

from api.models.activity import UnrepeatedFormData, RepeatedFormData
from api.models.codes import (
    HerbicideTypeCode,
    LiquidHerbicideCode,
    GranularHerbicideCode,
    HerbicideApplicationMethodCode,
    TerrestrialPlantCode,
)
from api.models.codes.code_tables import (
    ChemicalPrecautionaryStatement,
    PestManagementPlan,
    WindDirectionCode,
    AquaticPlantCode,
)
from api.models.enums.yes_no_unknown import YesNoUnknown


class ChemicalTreatmentContext(UnrepeatedFormData):
    pesticide_use_permit = models.CharField(max_length=128, blank=True, null=True)
    pest_management_plan = models.ForeignKey(
        PestManagementPlan, on_delete=models.PROTECT, blank=True, null=True
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
        db_table = '"activity"."treatment_chemical_context"'
        pass

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


class ChemicalTreatmentDetails(UnrepeatedFormData):
    tank_mix = models.BooleanField()
    chemical_application_method = models.ForeignKey(
        HerbicideApplicationMethodCode, on_delete=models.PROTECT
    )
    skip_application_rate_validation = models.BooleanField()

    legacy_object_had_error_flag_set = models.BooleanField(default=False)

    class Meta:
        db_table = '"activity"."treatment_chemical_details"'


class Herbicide(RepeatedFormData):
    index = models.PositiveSmallIntegerField(default=0)

    calculation_type = models.CharField(max_length=3)

    herbicide_type = models.ForeignKey(HerbicideTypeCode, on_delete=models.PROTECT)
    liquid_herbicide = models.ForeignKey(
        LiquidHerbicideCode, on_delete=models.PROTECT, null=True, blank=True
    )
    granular_herbicide = models.ForeignKey(
        GranularHerbicideCode, on_delete=models.PROTECT, null=True, blank=True
    )

    # D

    dilution = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)], blank=True, null=True
    )
    amount_of_mix = models.PositiveIntegerField(blank=True, null=True)
    area_treated_sqm = models.PositiveIntegerField(blank=True, null=True)

    # PAR
    product_application_rate = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )
    product_application_rate_calculated = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )
    delivery_rate_of_mix = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    def clean(self):
        super().clean()
        errors = {}
        if (self.liquid_herbicide is None and self.granular_herbicide is None) or (
            self.liquid_herbicide is not None and self.granular_herbicide is not None
        ):
            errors["liquid_herbicide"] = (
                "Exactly one of liquid_herbicide and granular_herbicide must be specified."
            )
            errors["granular_herbicide"] = (
                "Exactly one of liquid_herbicide and granular_herbicide must be specified."
            )
        if errors:
            raise ValidationError(errors)

    class Meta:
        db_table = '"activity"."treatment_chemical_herbicide"'
        ordering = [
            "index",
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(calculation_type__in=["D", "PAR"]),
                name="valid_calculation_type",
            )
        ]


class ChemicalTreatmentInvasivePlantRecord(RepeatedFormData):
    index = models.PositiveSmallIntegerField(default=0)
    percent_area_covered = models.DecimalField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    class Meta:
        abstract = True
        ordering = ["index"]


class ChemicalTreatmentTerrestrialInvasivePlantRecord(
    ChemicalTreatmentInvasivePlantRecord
):
    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."treatment_chemical_invasive_plant_terrestrial"'


class ChemicalTreatmentAquaticInvasivePlantRecord(ChemicalTreatmentInvasivePlantRecord):
    invasive_plant = models.ForeignKey(AquaticPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."treatment_chemical_invasive_plant_aquatic"'


"""
dilution:1.0378
herbIndex:0
plantIndex:0
product_application_rate:4.67
amount_of_undiluted_herbicide_used_liters:0.2076
"""


class ChemicalTreatmentCalculationResultsPerPlantHerbicideRecord(RepeatedFormData):
    herbicide_index = models.PositiveSmallIntegerField(
        default=0,
        db_comment="Identify the corresponding herbicide (by matching index)",
    )

    plant_index = models.PositiveSmallIntegerField(
        default=0,
        db_comment="Identify the corresponding invasive plant (by matching index)",
    )

    dilution = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )
    product_application_rate = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )
    amount_of_undiluted_herbicide_used_liters = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["plant_index", "herbicide_index"]
        db_table = (
            '"activity"."treatment_chemical_calculation_results_per_plant_by_herbicide"'
        )


class ChemicalTreatmentCalculationResultsPerPlantRecord(RepeatedFormData):
    index = models.PositiveSmallIntegerField(
        default=0,
        db_comment="Identify the corresponding invasive plant (by matching index)",
    )

    area_treated_sqm = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    percent_area_covered = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    amount_of_undiluted_herbicide_used_liters = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["index"]
        db_table = '"activity"."treatment_chemical_calculation_results_per_plant"'


class ChemicalTreatmentCalculationResultsRecord(UnrepeatedFormData):

    area_treated_sqm = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    percent_area_covered = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    amount_of_undiluted_herbicide_used_liters = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    calculation_type = models.CharField(blank=True, null=True)

    dilution = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"activity"."treatment_chemical_calculation_results"'


class ChemicalTreatmentTankMix(UnrepeatedFormData):

    amount_of_mix = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    delivery_rate_of_mix = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    calculation_type = models.CharField(max_length=16)

    class Meta:
        db_table = '"activity"."treatment_chemical_tank_mix"'


class ChemicalTreatmentTankMixHerbicide(RepeatedFormData):
    index = models.PositiveSmallIntegerField(
        default=0,
        db_comment="Identify the corresponding herbicide (by matching index)",
    )
    product_application_rate = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    product_application_rate_calculated = models.DecimalField(
        validators=[MinValueValidator(0)],
        max_digits=20,
        decimal_places=10,
        blank=True,
        null=True,
    )

    herbicide_type = models.ForeignKey(HerbicideTypeCode, on_delete=models.PROTECT)

    liquid_herbicide = models.ForeignKey(
        LiquidHerbicideCode, on_delete=models.PROTECT, null=True, blank=True
    )
    granular_herbicide = models.ForeignKey(
        GranularHerbicideCode, on_delete=models.PROTECT, null=True, blank=True
    )

    class Meta:
        db_table = '"activity"."treatment_chemical_tank_mix_herbicide"'
