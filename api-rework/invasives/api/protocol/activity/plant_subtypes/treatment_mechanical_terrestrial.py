from typing import List, Literal, Optional
from pydantic import Field, field_validator
from api.protocol.activity.validators.distinct_entries import distinct_entries
from api.protocol.activity.plant_subtypes.base_form_schema import (
    BaseFormSchema,
    CleanSchema,
    DraftBaseFormSchema,
)

from api.models.enums import PlantDisposalFormat
from api.protocol.activity.validators.code_validation import (
    TerrestrialPlantCodeType,
    PlantMechanicalTreatmentMethodCodeType,
    DisposalMethodCodeType,
)


class DraftEntry(CleanSchema):
    disposed_material_amount: Optional[int]
    disposed_material_format: Optional[PlantDisposalFormat]
    disposal_method: Optional[DisposalMethodCodeType]
    invasive_plant: Optional[TerrestrialPlantCodeType]
    mechanical_method: Optional[PlantMechanicalTreatmentMethodCodeType]
    treated_area_msq: Optional[int]


class Entry(DraftEntry):
    disposal_method: DisposalMethodCodeType
    invasive_plant: TerrestrialPlantCodeType
    mechanical_method: PlantMechanicalTreatmentMethodCodeType
    treated_area_msq: int = Field(..., gt=0)


class DraftSubtypeData(CleanSchema):
    entries: List[DraftEntry]


class SubtypeData(DraftSubtypeData):
    entries: List[Entry] = Field(..., min_length=1)

    @field_validator("entries")
    @classmethod
    def unique_entries(cls, v):
        return distinct_entries(
            v,
            unique_keys=["invasive_plant", "mechanical_method"],
            error_message="Entries must contain a unique Invasive Plant / Mechanical Method combination",
        )


class DraftTreatmentMechanicalTerrestrial(DraftBaseFormSchema):
    subtype: Literal["Treatment_Mechanical_Plant_Terrestrial"]
    subtype_data: DraftSubtypeData


class TreatmentMechanicalTerrestrial(BaseFormSchema):
    subtype: Literal["Treatment_Mechanical_Plant_Terrestrial"]
    subtype_data: SubtypeData
