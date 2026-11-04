from ninja import Schema
from typing import Optional, List
from api.models.activity import (
    TerrestrialBiocontrolAgentCount,
    DraftTerrestrialBiocontrolAgentCount,
    TerrestrialBiocontrolAgentCountExtended,
    DraftTerrestrialBiocontrolAgentCountExtended,
)

type AgentCount = TerrestrialBiocontrolAgentCount | DraftTerrestrialBiocontrolAgentCount
type ExtAgentCount = TerrestrialBiocontrolAgentCountExtended | DraftTerrestrialBiocontrolAgentCountExtended


class SimpleAgentCountOut(Schema):
    quantity: Optional[int]
    stage: Optional[str]

    @staticmethod
    def resolve_stage(obj: AgentCount):
        return obj.stage.code if obj.stage else None


class SimpleAgentCountOutMixin(Schema):
    actual_biological_agents: List[SimpleAgentCountOut]
    estimated_biological_agents: List[SimpleAgentCountOut]

    @staticmethod
    def resolve_estimated_biological_agents(obj) -> List[ExtendedAgentCountOut]:
        return TerrestrialBiocontrolAgentCount.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=True
        )

    @staticmethod
    def resolve_actual_biological_agents(obj) -> List[ExtendedAgentCountOut]:
        return TerrestrialBiocontrolAgentCount.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=False
        )


class DraftSimpleAgentCountOutMixin(SimpleAgentCountOutMixin):
    @staticmethod
    def resolve_estimated_biological_agents(obj) -> List[ExtendedAgentCountOut]:
        return DraftTerrestrialBiocontrolAgentCount.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=True
        )

    @staticmethod
    def resolve_actual_biological_agents(obj) -> List[ExtendedAgentCountOut]:
        return DraftTerrestrialBiocontrolAgentCount.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=False
        )


class ExtendedAgentCountOut(SimpleAgentCountOut):
    agent_location: Optional[str]
    plant_position: Optional[str]

    @staticmethod
    def resolve_agent_location(obj: ExtendedAgentCountOut):
        return obj.agent_location.code if obj.agent_location else None

    @staticmethod
    def resolve_plant_position(obj: ExtendedAgentCountOut):
        return obj.plant_position.code if obj.plant_position else None


class ExtendedAgentCountOutMixin(SimpleAgentCountOutMixin):
    actual_biological_agents: List[ExtendedAgentCountOut]
    estimated_biological_agents: List[ExtendedAgentCountOut]

    @staticmethod
    def resolve_estimated_biological_agents(obj) -> List[ExtendedAgentCountOut]:
        return TerrestrialBiocontrolAgentCountExtended.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=True
        )

    @staticmethod
    def resolve_actual_biological_agents(obj) -> List[ExtendedAgentCountOut]:
        return TerrestrialBiocontrolAgentCountExtended.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=False
        )


class DraftExtendedAgentCountOutMixin(
    ExtendedAgentCountOutMixin,
    DraftSimpleAgentCountOutMixin,
):
    @staticmethod
    def resolve_estimated_biological_agents(obj) -> List[ExtendedAgentCountOut]:
        return DraftTerrestrialBiocontrolAgentCountExtended.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=True
        )

    @staticmethod
    def resolve_actual_biological_agents(obj) -> List[ExtendedAgentCountOut]:
        return DraftTerrestrialBiocontrolAgentCountExtended.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=False
        )
