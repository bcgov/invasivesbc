from typing import List, Literal, Optional
from pydantic import Field, field_validator
from api.protocol.activity.validators.no_repeat_key import no_repeat_key
from api.protocol.activity.plant_subtypes.base_form_schema import (
    BaseFormSchema,
    CleanSchema,
)

from api.models.enums import PlantDisposalFormat
from api.protocol.activity.validators.code_validation import (
    TerrestrialPlantCodeType,
    PlantMechanicalTreatmentMethodCodeType,
    DisposalMethodCodeType,
)


class Entry(CleanSchema):
    disposed_material_amount: Optional[int]
    disposed_material_format: Optional[PlantDisposalFormat]
    disposal_method: DisposalMethodCodeType
    invasive_plant: TerrestrialPlantCodeType
    mechanical_method: PlantMechanicalTreatmentMethodCodeType
    treated_area_msq: int = Field(..., gt=0)


class SubtypeData(CleanSchema):
    entries: List[Entry] = Field(..., min_length=1)

    @field_validator("entries")
    @classmethod
    def unique_plants(cls, v):
        return no_repeat_key(v, key="invasive_plant", key_label="Invasive Plant")


class TreatmentMechanicalTerrestrial(BaseFormSchema):
    subtype: Literal["Treatment_Mechanical_Plant_Terrestrial"]
    subtype_data: SubtypeData
