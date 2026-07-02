from django.core.validators import MinValueValidator
from django.db import models

from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes.code_tables import (
    AquaticPlantCode,
    TerrestrialPlantCode,
    PlantMechanicalTreatmentMethodCode,
    DisposalMethodCode,
)
from api.models.enums.plant_disposal_format import PlantDisposalFormat


class BaseModel(models.Model):
    """
    Abstract Model for DraftPlantMechanicalTreatments
    """

    invasive_plant = models.ForeignKey("PlantCode", on_delete=models.PROTECT)
    treated_area_msq = models.FloatField(validators=[MinValueValidator(0)])
    mechanical_method = models.ForeignKey(
        PlantMechanicalTreatmentMethodCode, on_delete=models.PROTECT
    )
    disposal_method = models.ForeignKey(DisposalMethodCode, on_delete=models.PROTECT)
    disposed_material_format = models.CharField(
        choices=PlantDisposalFormat, blank=True, null=True
    )
    disposed_material_amount = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        abstract = True


class TerrestrialPlantMechanicalTreatmentEntry(BaseModel, RepeatedFormData):
    """
    Mechanical Treatment Information for Terrestrial Plant activities
    """

    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."treatment_mechanical_entries_pt"'


class AquaticPlantMechanicalTreatmentEntry(BaseModel, RepeatedFormData):
    """
    Mechanical Treatment Information for Aquatic Plant activities
    """

    invasive_plant = models.ForeignKey(AquaticPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."treatment_mechanical_entries_pa"'


class DraftPlantMechanicalTreatmentEntry(BaseModel):
    treated_area_msq = models.FloatField(blank=True, null=True)
    mechanical_method = models.ForeignKey(
        PlantMechanicalTreatmentMethodCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    disposal_method = models.ForeignKey(
        DisposalMethodCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    class Meta:
        abstract = True


class DraftTerrestrialPlantMechanicalTreatmentEntry(
    DraftPlantMechanicalTreatmentEntry, DraftRepeatedFormData
):
    """
    Mechanical Treatment Information for Terrestrial Plant activities
    """

    invasive_plant = models.ForeignKey(
        TerrestrialPlantCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"draft_activity"."treatment_mechanical_entries_pt"'


class DraftAquaticPlantMechanicalTreatmentEntry(
    DraftPlantMechanicalTreatmentEntry, DraftRepeatedFormData
):
    """
    Mechanical Treatment Information for Aquatic Plant activities
    """

    invasive_plant = models.ForeignKey(
        AquaticPlantCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"draft_activity"."treatment_mechanical_entries_pa"'
