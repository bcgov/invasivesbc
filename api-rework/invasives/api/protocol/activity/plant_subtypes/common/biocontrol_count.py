from pydantic import Field
from api.protocol.activity.validators.code_validation import (
    BioAgentLifeStageCodeType,
    PlantPositionCodeType,
    AgentLocationFoundCodeType,
)
from api.protocol.activity.plant_subtypes.base_form_schema import CleanSchema


class BiocontrolCountSimple(CleanSchema):
    quantity: int = Field(..., gt=0)
    stage: BioAgentLifeStageCodeType
    is_estimate: bool = False


class BiocontrolCountExtended(BiocontrolCountSimple):
    plant_position: PlantPositionCodeType
    agent_location: AgentLocationFoundCodeType
