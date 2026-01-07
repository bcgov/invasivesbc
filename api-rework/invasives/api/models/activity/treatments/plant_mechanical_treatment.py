from django.core.validators import MinValueValidator
from django.db import models

from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from api.models_public.codes import (
    AquaticPlantCode,
    TerrestrialPlantCode,
    PlantMechanicalTreatmentMethodCode,
    DisposalMethodCode,
)
from api.models_public.enums import PlantDisposalFormat


class PlantMechanicalTreatment(BaseOneToManyActivityTable):
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
                fields=["activity_id", "invasive_plant"],
                name="uq_mechanical_plant_treat",
            )
        ]


class TerrestrialPlantMechanicalTreatment(PlantMechanicalTreatment):
    """
    Mechanical Treatment Information for Terrestrial Plant activities
    """

    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."terrestrial_plant_mechanical_treatment"'
        pass


class AquaticPlantMechanicalTreatment(PlantMechanicalTreatment):
    """
    Mechanical Treatment Information for Aquatic Plant activities
    """

    invasive_plant = models.ForeignKey(AquaticPlantCode, on_delete=models.PROTECT)
    details = models.CharField(max_length=256)

    class Meta:
        db_table = '"activity"."aquatic_plant_mechanical_treatment"'
        pass
