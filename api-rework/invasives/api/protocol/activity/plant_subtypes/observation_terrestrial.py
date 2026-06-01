from typing import List, Literal, Optional, TypedDict
from pydantic import Field, model_validator, field_validator
from api.protocol.activity.plant_subtypes.base_form_schema import (
    BaseFormSchema,
    CleanSchema,
)
from api.protocol.activity.plant_subtypes.common.voucher_specimen import (
    VoucherSpecimenSchema,
)
from api.protocol.activity.validators.no_repeat_key import no_repeat_key
from api.models.enums import YesNoUnknown, ObservationType
from api.protocol.activity.validators.code_validation import (
    DensityCodeType,
    DistributionCodeType,
    PlantLifeStageCodeType,
    TerrestrialPlantCodeType,
    AspectCodeType,
    SlopePercentCodeType,
    SoilTextureCodeType,
    SpecificUseCodeType,
)


class SpecificUseType(CleanSchema):
    specific_use: SpecificUseCodeType


class Context(TypedDict):
    research_observation: YesNoUnknown
    suitable_for_biocontrol_agent: YesNoUnknown
    visible_well_nearby: YesNoUnknown
    aspect: AspectCodeType
    slope_percent: SlopePercentCodeType
    soil_texture: Optional[SoilTextureCodeType] = None
    specific_uses: List[SpecificUseType] = Field(..., min_length=1)


class Entry(CleanSchema):
    observation_type: ObservationType
    invasive_plant: TerrestrialPlantCodeType  # Always required

    # These are technically Optional in the schema to allow "Negative" types to pass
    density: Optional[DensityCodeType] = None
    distribution: Optional[DistributionCodeType] = None
    life_stage: Optional[PlantLifeStageCodeType] = None
    voucher_specimen: Optional[VoucherSpecimenSchema] = None

    @model_validator(mode="after")
    def check_observation_logic(self) -> "Entry":
        # If it's NOT Negative, we expect the extra fields
        if self.observation_type != "Negative":
            required_fields = ["density", "distribution", "life_stage"]
            for field_name in required_fields:
                if getattr(self, field_name) is None:
                    raise ValueError(
                        f"{field_name} is required when observation_type is {self.observation_type}"
                    )
        return self


class SubtypeData(CleanSchema):
    context: Context
    pretreatment_observation: YesNoUnknown
    entries: List[Entry] = Field(..., min_length=1)

    @field_validator("entries")
    @classmethod
    def unique_plants(cls, v):
        return no_repeat_key(v, key="invasive_plant", key_label="Invasive Plant")


class ObservationTerrestrialSchema(BaseFormSchema):
    subtype: Literal["Observation_Plant_Terrestrial"]
    subtype_data: SubtypeData = Field(...)
