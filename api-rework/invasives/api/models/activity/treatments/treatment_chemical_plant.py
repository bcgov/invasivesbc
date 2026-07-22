from django.db import models
from enum import Enum
from api.models.activity import UnrepeatedFormData, DraftUnrepeatedFormData
from django.core.validators import MinValueValidator
from api.models.codes import (
    HerbicideApplicationMethodCode,
)


class CalculationType(models.TextChoices):
    APPLICATION_RATE = "Product Application Rate", "Product Application Rate"
    DILUTION = "Dilution", "Dilution"


class BaseModel(models.Model):
    application_method = models.ForeignKey(
        HerbicideApplicationMethodCode, on_delete=models.PROTECT
    )
    tank_mix = models.BooleanField()
    calculation_type = models.CharField(choices=CalculationType)
    area_treated_sqm = models.PositiveIntegerField(blank=True, null=True)
    amount_mix_used_l = models.FloatField(validators=[MinValueValidator(0.0)])

    # Product application rate Calculations
    delivery_rate = models.FloatField(
        validators=[MinValueValidator(0.0)], null=True, blank=True
    )
    # Dilution Calculation
    dilution_percent = models.FloatField(
        validators=[MinValueValidator(0.0)], null=True, blank=True
    )

    class Meta:
        abstract = True


class ChemTreatmentContext(BaseModel, UnrepeatedFormData):
    class Meta:
        db_table = '"activity"."chem_treatment_context"'


class DraftChemTreatmentContext(BaseModel, DraftUnrepeatedFormData):
    application_method = models.ForeignKey(
        HerbicideApplicationMethodCode, null=True, blank=True, on_delete=models.PROTECT
    )
    tank_mix = models.BooleanField(null=True, blank=True)
    calculation_type = models.CharField(choices=CalculationType, null=True, blank=True)
    amount_mix_used_l = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = '"draft_activity"."chem_treatment_context"'
