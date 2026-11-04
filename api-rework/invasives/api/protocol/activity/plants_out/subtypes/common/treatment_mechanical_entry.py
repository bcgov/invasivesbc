from ninja import Schema
from typing import Optional

from api.models.activity import (
    AquaticPlantMechanicalTreatmentEntry,
    TerrestrialPlantMechanicalTreatmentEntry,
)

type Entry = AquaticPlantMechanicalTreatmentEntry | TerrestrialPlantMechanicalTreatmentEntry


class MechanicalTreatmentEntryOut(Schema):
    disposed_material_amount: Optional[float] = None
    disposed_material_format: Optional[str] = None
    disposal_method: Optional[str] = None
    invasive_plant: Optional[str] = None
    mechanical_method: Optional[str] = None
    treated_area_msq: Optional[float] = None

    @staticmethod
    def resolve_disposal_method(obj: Entry):
        return obj.disposal_method.code if obj.disposal_method else None

    @staticmethod
    def resolve_invasive_plant(obj: Entry):
        return obj.invasive_plant.code if obj.invasive_plant else None

    @staticmethod
    def resolve_mechanical_method(obj: Entry):
        return obj.mechanical_method.code if obj.mechanical_method else None
