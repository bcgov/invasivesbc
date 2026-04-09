from typing import List, Literal, Union, Annotated, Dict, TypedDict, Optional
from ninja import NinjaAPI, Schema
from pydantic import Field, model_validator
from pydantic_geojson import PointModel, FeatureModel, PolygonModel, MultiPolygonModel
from api.models.activity import ActivitySubtypes, ActivityType, FormStatus
from api.protocol.activity.plant_subtypes.base_form_schema import BaseFormSchema
from api.protocol.activity.plant_subtypes.common.voucher_specimen import VoucherSpecimenSchema


class Entry(Schema):
    observation_type: str = Field(...)  # e.g., "Positive" or "Negative"
    invasive_plant: str = Field(...)    # Always required

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
                    raise ValueError(f"{field_name} is required when observation_type is {self.observation_type}")

        return self

class SubtypeData(Schema):
    entries: List[Entry] = Field(..., min_length=1)
    pretreatment_observation: str = Field(...)
    research_observation: str = Field(...)
    visible_well_nearby: str = Field(...)
    aspect: str = Field(...)
    slope_percent: str = Field(...)
    soil_texture: str = Field(...)
    specific_uses: List[str] = Field(..., min_length=1)
    suitable_for_biocontrol_agent: str = Field(...)

class ObservationTerrestrialSchema(BaseFormSchema):
    subtype: Literal['Observation_Plant_Terrestrial']
    subtype_data: SubtypeData = Field(...)
