from django.core.validators import MinValueValidator
from django.db import models

from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from api.models.codes.code_tables import (
    AquaticPlantCode,
    TerrestrialPlantCode,
    PlantMechanicalTreatmentMethodCode,
    DisposalMethodCode,
)
from api.models.enums.plant_disposal_format import PlantDisposalFormat


class PlantMechanicalTreatmentEntry(BaseOneToManyActivityTable):
    """
    Abstract Model for PlantMechanicalTreatments
    """

    invasive_plant = models.ForeignKey("PlantCode", on_delete=models.PROTECT)
    treated_area_msq = models.FloatField(validators=[MinValueValidator(0)])
    mechanical_method = models.ForeignKey(
        PlantMechanicalTreatmentMethodCode, on_delete=models.PROTECT
    )
    disposal_method = models.ForeignKey(DisposalMethodCode, on_delete=models.PROTECT)
    disposed_material_format = models.CharField(choices=PlantDisposalFormat)
    disposed_material_amount = models.PositiveIntegerField()

    class Meta:
        abstract = True
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "invasive_plant"],
                name="uq_mechanical_plant_treat",
            )
        ]


class TerrestrialPlantMechanicalTreatmentEntry(PlantMechanicalTreatmentEntry):
    """
    Mechanical Treatment Information for Terrestrial Plant activities
    """

    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."treatment_mechanical_entries_pt"'


class AquaticPlantMechanicalTreatmentEntry(PlantMechanicalTreatmentEntry):
    """
    Mechanical Treatment Information for Aquatic Plant activities
    """

    invasive_plant = models.ForeignKey(AquaticPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."treatment_mechanical_entries_pa"'
