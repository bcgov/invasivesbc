from typing import List, Literal, Optional
from pydantic import Field, model_validator, field_validator
from api.protocol.activity.validators.no_repeat_key import no_repeat_key
from api.protocol.activity.validators.check_sum import check_sum
from api.protocol.activity.plant_subtypes.base_form_schema import (
    BaseFormSchema,
    CleanSchema,
    DraftBaseFormSchema,
)
from api.protocol.activity.plant_subtypes.common.voucher_specimen import (
    VoucherSpecimenSchema,
)
from api.models.enums import YesNoUnknown, ObservationType
from api.protocol.activity.validators.code_validation import (
    DensityCodeType,
    DistributionCodeType,
    PlantLifeStageCodeType,
    AquaticPlantCodeType,
    ShorelineTypeCodeType,
    AdjacentLandUseCodeType,
    WaterbodyUseCodeType,
    WaterbodyFlowCodeType,
    WaterbodyFlowSeasonalCodeType,
    WaterbodyTypeCodeType,
    WaterLevelManagementType,
    WaterbodySubstrateCodeType,
)


class DraftContext(CleanSchema):
    suitable_for_biocontrol: Optional[YesNoUnknown]


class Context(DraftContext):
    suitable_for_biocontrol: YesNoUnknown


class DraftWaterbodyContext(CleanSchema):
    inflow_permanent: List[WaterbodyFlowCodeType]
    inflow_seasonal: List[WaterbodyFlowSeasonalCodeType]
    outflow_permanent: List[WaterbodyFlowCodeType]
    outflow_seasonal: List[WaterbodyFlowCodeType]
    access: Optional[str]
    comment: Optional[str]
    name_local: Optional[str]
    name_gazetted: Optional[str]
    tidal_influence: Optional[YesNoUnknown]
    type: Optional[WaterbodyTypeCodeType]
    colour: Optional[str]
    max_depth_m: Optional[int]
    secchi_depth: Optional[int]


class WaterbodyContext(DraftWaterbodyContext):
    tidal_influence: YesNoUnknown
    type: WaterbodyTypeCodeType
    max_depth_m: Optional[int] = Field(..., gt=0)
    secchi_depth: Optional[int] = Field(..., gt=0)


class DraftShorelineType(CleanSchema):
    shoreline_type: Optional[ShorelineTypeCodeType]
    percent_covered: Optional[int]


class ShorelineType(DraftShorelineType):
    shoreline_type: ShorelineTypeCodeType
    percent_covered: int = Field(..., gt=0, le=100)


class DraftEntry(CleanSchema):
    sample_point_id: Optional[str] = None
    observation_type: Optional[ObservationType]
    invasive_plant: Optional[AquaticPlantCodeType]

    # These are technically Optional in the schema to allow "Negative" types to pass
    density: Optional[DensityCodeType] = None
    distribution: Optional[DistributionCodeType] = None
    life_stage: Optional[PlantLifeStageCodeType] = None
    voucher_specimen: Optional[VoucherSpecimenSchema] = None


class Entry(DraftEntry):
    observation_type: ObservationType
    invasive_plant: AquaticPlantCodeType

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


class DraftSubtypeData(CleanSchema):
    context: DraftContext
    waterbody_context: DraftWaterbodyContext
    entries: List[DraftEntry]

    substrate_type: List[WaterbodySubstrateCodeType]
    water_use: List[WaterbodyUseCodeType]
    waterlevel_management: List[WaterLevelManagementType]
    adjacent_land_use: List[AdjacentLandUseCodeType]
    pretreatment_observation: Optional[YesNoUnknown]

    shoreline_types: List[DraftShorelineType]


class SubtypeData(DraftSubtypeData):
    context: Context
    waterbody_context: WaterbodyContext
    entries: List[Entry] = Field(..., min_length=1)
    pretreatment_observation: YesNoUnknown
    shoreline_types: List[ShorelineType] = Field(..., min_length=1)

    @field_validator("entries")
    @classmethod
    def unique_plants(cls, v):
        return no_repeat_key(v, key="invasive_plant", key_label="Invasive Plant")

    @field_validator("shoreline_types")
    @classmethod
    def shoreline_sum(cls, v):
        return check_sum(v, expected=100, key="percent_covered")

    @field_validator("shoreline_types")
    @classmethod
    def unique_shoreline_types(cls, v):
        return no_repeat_key(v, key="shoreline_type", key_label="Shoreline Types")


class DraftObservationAquaticSchema(DraftBaseFormSchema):
    subtype: Literal["Observation_Plant_Aquatic"]
    subtype_data: DraftSubtypeData


class ObservationAquaticSchema(BaseFormSchema):
    subtype: Literal["Observation_Plant_Aquatic"]
    subtype_data: SubtypeData
