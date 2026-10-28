from ninja import Schema
from typing import Optional, List
from api.models.activity import (
    WeatherConditions,
    DraftWeatherConditions,
    MicrositeCondition,
    DraftMicrositeCondition,
    TargetPlantPhenology,
    DraftTargetPlantPhenology,
    TerrestrialBiocontrolAgentCount,
    DraftTerrestrialBiocontrolAgentCount,
    TerrestrialBiocontrolAgentCountExtended,
    DraftTerrestrialBiocontrolAgentCountExtended,
    TargetPlantHeights,
    DraftTargetPlantHeights,
)

type Weather = WeatherConditions | DraftWeatherConditions
type Microsite = MicrositeCondition | DraftMicrositeCondition
type Phenology = TargetPlantPhenology | DraftTargetPlantPhenology
type AgentCount = TerrestrialBiocontrolAgentCount | DraftTerrestrialBiocontrolAgentCount
type ExtAgentCount = TerrestrialBiocontrolAgentCountExtended | DraftTerrestrialBiocontrolAgentCountExtended


class MicrositeConditionOut(Schema):
    mesoslope_position: Optional[str]
    site_surface_shape: Optional[str]

    @staticmethod
    def resolve_mesoslope_position(obj: Microsite):
        return obj.mesoslope_position.code if obj.mesoslope_position else None

    @staticmethod
    def resolve_site_surface_shape(obj: Microsite):
        return obj.site_surface_shape.code if obj.site_surface_shape else None


class TargetPlantHeight(Schema):
    height_cm: Optional[int]


class TargetPlantPhenologyOut(Schema):
    winter_dormant: Optional[int]
    seedlings: Optional[int]
    rosettes: Optional[int]
    bolts: Optional[int]
    flowering: Optional[int]
    seeds_forming: Optional[int]
    senescent: Optional[int]
    target_plant_heights: List[TargetPlantHeight]

    @staticmethod
    def resolve_target_plant_heights(obj: Phenology):
        return TargetPlantHeights.objects.filter(
            activity_data_record=obj.activity_data_record
        )


class DraftTargetPlantPhenologyOut(TargetPlantPhenologyOut):
    @staticmethod
    def resolve_target_plant_heights(obj: Phenology):
        return DraftTargetPlantHeights.objects.filter(
            activity_data_record=obj.activity_data_record
        )


class WeatherConditionsOut(Schema):
    comments: Optional[str]
    cloud_cover: Optional[str]
    precipitation: Optional[str]
    temperature: Optional[int]
    wind_direction: Optional[str]
    wind_speed_kmh: Optional[int]

    @staticmethod
    def resolve_cloud_cover(obj: Weather):
        return obj.cloud_cover.code if obj.cloud_cover else None

    @staticmethod
    def resolve_precipitation(obj: Weather):
        return obj.precipitation.code if obj.precipitation else None

    @staticmethod
    def resolve_wind_direction(obj: Weather):
        return obj.wind_direction.code if obj.wind_direction else None


class SimpleAgentCountOut(Schema):
    quantity: Optional[int]
    stage: Optional[str]

    @staticmethod
    def resolve_stage(obj: AgentCount):
        return obj.stage.code if obj.stage else None


class ExtendedAgentCountOut(SimpleAgentCountOut):
    agent_location: Optional[str]
    plant_position: Optional[str]

    @staticmethod
    def resolve_agent_location(obj: ExtendedAgentCountOut):
        return obj.agent_location.code if obj.agent_location else None

    @staticmethod
    def resolve_plant_position(obj: ExtendedAgentCountOut):
        return obj.plant_position.code if obj.plant_position else None
