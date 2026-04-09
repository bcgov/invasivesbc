from typing import List, Literal, Optional
from pydantic import Field, model_validator
from api.protocol.activity.plant_subtypes.base_form_schema import (
    BaseFormSchema,
    CleanSchema,
)
from api.protocol.activity.plant_subtypes.common.voucher_specimen import (
    VoucherSpecimenSchema,
)


class ShorelineType(CleanSchema):
    shoreline_type: str = Field(...)
    percent_covered: int = Field(..., gt=0, le=100)


class Entry(CleanSchema):
    sample_point_id: Optional[str] = None
    observation_type: str = Field(...)  # e.g., "Positive" or "Negative"
    invasive_plant: str = Field(...)  # Always required

    # These are technically Optional in the schema to allow "Negative" types to pass
    density: Optional[str] = None
    distribution: Optional[str] = None
    life_stage: Optional[str] = None
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
    entries: List[Entry] = Field(..., min_length=1)
    adjacent_land_use: List[str]
    pretreatment_observation: str
    substrate_type: List[str]
    shoreline_types: List[ShorelineType] = Field(..., min_length=1)
    water_use: List[str]
    waterlevel_management: Optional[List[str]] = None
    inflow_permanent: Optional[List[str]] = None
    inflow_seasonal: Optional[List[str]] = None
    outflow_permanent: Optional[List[str]] = None
    outflow_seasonal: Optional[List[str]] = None
    access: Optional[str] = None
    colour: Optional[str] = None
    comment: Optional[str] = None
    max_depth_m: Optional[int] = Field(None, ge=1)
    name_gazetted: Optional[str] = None
    name_local: Optional[str] = None
    suitable_for_biocontrol: str
    secchi_depth: Optional[int] = None
    tidal_influence: str
    type: str


class ObservationAquaticSchema(BaseFormSchema):
    subtype: Literal["Observation_Plant_Aquatic"]
    subtype_data: SubtypeData = Field(...)
