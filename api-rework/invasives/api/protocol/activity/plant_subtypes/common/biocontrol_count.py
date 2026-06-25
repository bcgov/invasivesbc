from pydantic import Field
from typing import Optional
from api.protocol.activity.validators.code_validation import (
    BioAgentLifeStageCodeType,
    PlantPositionCodeType,
    AgentLocationFoundCodeType,
)
from api.protocol.activity.plant_subtypes.base_form_schema import CleanSchema


class DraftBiocontrolCountSimple(CleanSchema):
    quantity: Optional[int]
    stage: Optional[BioAgentLifeStageCodeType]
    is_estimate: bool = False


class BiocontrolCountSimple(DraftBiocontrolCountSimple):
    quantity: int = Field(..., gt=0)
    stage: BioAgentLifeStageCodeType


class DraftBiocontrolCountExtended(DraftBiocontrolCountSimple):
    plant_position: Optional[PlantPositionCodeType]
    agent_location: Optional[AgentLocationFoundCodeType]


class BiocontrolCountExtended(BiocontrolCountSimple):
    plant_position: PlantPositionCodeType
    agent_location: AgentLocationFoundCodeType
