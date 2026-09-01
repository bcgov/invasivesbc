from typing import List, Literal, Optional
from pydantic import Field, model_validator, field_validator
from api.protocol.activity.validators.distinct_entries import distinct_entries
from api.protocol.activity.validators.no_repeat_key import no_repeat_key
from api.protocol.activity.validators.check_sum import check_sum
from api.protocol.activity.plant_subtypes.base_form_schema import (
    BaseFormSchema,
    CleanSchema,
    DraftBaseFormSchema,
)

from api.models.enums import PlantDisposalFormat
from api.protocol.activity.validators.code_validation import (
    AquaticPlantCodeType,
    PlantMechanicalTreatmentMethodCodeType,
    DisposalMethodCodeType,
    ShorelineTypeCodeType,
)


class DraftEntry(CleanSchema):
    disposed_material_amount: Optional[float]
    disposed_material_format: Optional[PlantDisposalFormat]
    disposal_method: Optional[DisposalMethodCodeType]
    invasive_plant: Optional[AquaticPlantCodeType]
    mechanical_method: Optional[PlantMechanicalTreatmentMethodCodeType]
    treated_area_msq: Optional[int]


class Entry(DraftEntry):
    disposal_method: DisposalMethodCodeType
    invasive_plant: AquaticPlantCodeType
    mechanical_method: PlantMechanicalTreatmentMethodCodeType
    treated_area_msq: int = Field(..., gt=0)

    @model_validator(mode="after")
    def validate_materials(self) -> "Entry":
        if self.disposed_material_format and not self.disposed_material_amount:
            raise ValueError(
                "Disposed Material Format required when disposed material amount not blank."
            )
        elif self.disposed_material_amount and not self.disposed_material_format:
            raise ValueError(
                "Disposed Material Amount required when disposed material amount not blank."
            )
        return self


class DraftShorelineType(CleanSchema):
    shoreline_type: Optional[ShorelineTypeCodeType]
    percent_covered: Optional[int]


class ShorelineType(DraftShorelineType):
    shoreline_type: ShorelineTypeCodeType
    percent_covered: int = Field(..., gt=0, le=100)


class DraftSubtypeData(CleanSchema):
    entries: List[DraftEntry]
    shoreline_types: List[DraftShorelineType]
    authorization_information: Optional[str] = None


class SubtypeData(DraftSubtypeData):
    entries: List[Entry] = Field(..., min_length=1)
    shoreline_types: List[ShorelineType]

    @field_validator("entries")
    @classmethod
    def unique_entries(cls, v):
        return distinct_entries(
            v,
            unique_keys=["invasive_plant", "mechanical_method"],
            error_message="Entries must contain a unique Invasive Plant / Mechanical Method combination",
        )

    @field_validator("shoreline_types")
    @classmethod
    def shoreline_sum(cls, v):
        return check_sum(v, expected=100, key="percent_covered")

    @field_validator("shoreline_types")
    @classmethod
    def unique_shoreline_types(cls, v):
        return no_repeat_key(v, key="shoreline_type", key_label="Shoreline Types")


class DraftTreatmentMechanicalAquatic(DraftBaseFormSchema):
    subtype: Literal["Treatment_Mechanical_Plant_Aquatic"]
    subtype_data: DraftSubtypeData


class TreatmentMechanicalAquatic(BaseFormSchema):
    subtype: Literal["Treatment_Mechanical_Plant_Aquatic"]
    subtype_data: SubtypeData
