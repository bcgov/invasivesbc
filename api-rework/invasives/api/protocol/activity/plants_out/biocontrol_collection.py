from . import BaseRecordOut, DraftBaseRecordOut
from typing import Optional, List, Literal
from datetime import datetime
from api.models.activity import (
    Activity,
    DraftActivity,
    TerrestrialBiocontrolCollectionEntry,
    DraftTerrestrialBiocontrolCollectionEntry,
    WeatherConditions,
    DraftWeatherConditions,
    MicrositeCondition,
    DraftMicrositeCondition,
    TargetPlantPhenology,
    DraftTargetPlantPhenology,
    TerrestrialBiocontrolAgentCount,
    DraftTerrestrialBiocontrolAgentCount,
)
from .common import (
    MicrositeConditionOut,
    TargetPlantPhenologyOut,
    DraftTargetPlantPhenologyOut,
    WeatherConditionsOut,
    SimpleAgentCountOut,
)
from ninja import Schema


##########
# Shared
####
class Entry(Schema):
    invasive_plant: Optional[str]
    biocontrol_agent: Optional[str]
    historical_iapp_site: Optional[int]
    collection_type: Optional[str]
    plant_count_collection: Optional[int]
    time_collection_duration_minutes: Optional[int]
    collection_method: Optional[str]
    number_of_sweeps: Optional[int]
    start_time_collecting: Optional[datetime]
    end_time_collecting: Optional[datetime]
    comment: Optional[int]
    actual_biological_agents: List[SimpleAgentCountOut]
    estimated_biological_agents: List[SimpleAgentCountOut]

    @staticmethod
    def resolve_invasive_plant(obj):
        return obj.invasive_plant.code if obj.invasive_plant else None

    @staticmethod
    def resolve_biocontrol_agent(obj):
        return obj.biocontrol_agent.code if obj.biocontrol_agent else None

    @staticmethod
    def resolve_collection_method(obj):
        return obj.collection_method.code if obj.collection_method else None

    @staticmethod
    def resolve_estimated_biological_agents(obj) -> List[SimpleAgentCountOut]:
        return TerrestrialBiocontrolAgentCount.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=True
        )

    @staticmethod
    def resolve_actual_biological_agents(obj) -> List[SimpleAgentCountOut]:
        return TerrestrialBiocontrolAgentCount.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=False
        )


##########
# Regular
####
class SubtypeData(Schema):
    entries: List[Entry]
    target_plant_phenology: Optional[TargetPlantPhenologyOut] = None
    microsite_details: MicrositeConditionOut
    weather_conditions: WeatherConditionsOut

    @staticmethod
    def resolve_entries(obj: Activity):
        return TerrestrialBiocontrolCollectionEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("invasive_plant", "biocontrol_agent")

    @staticmethod
    def resolve_target_plant_phenology(
        obj: Activity,
    ) -> Optional[TargetPlantPhenologyOut]:
        return TargetPlantPhenology.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()

    @staticmethod
    def resolve_microsite_details(obj: Activity):
        return (
            MicrositeCondition.objects.filter(activity_data_record__activity_id=obj.id)
            .select_related("mesoslope_position", "site_surface_shape")
            .first()
        )

    @staticmethod
    def resolve_weather_conditions(obj: Activity):
        return (
            WeatherConditions.objects.filter(activity_data_record__activity_id=obj.id)
            .select_related("cloud_cover", "precipitation", "wind_direction")
            .first()
        )


##########
# Draft
####
class DraftEntry(Entry):
    @staticmethod
    def resolve_estimated_biological_agents(obj) -> List[SimpleAgentCountOut]:
        return DraftTerrestrialBiocontrolAgentCount.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=True
        )

    @staticmethod
    def resolve_actual_biological_agents(obj) -> List[SimpleAgentCountOut]:
        return DraftTerrestrialBiocontrolAgentCount.objects.filter(
            activity_data_record=obj.activity_data_record, is_estimate=False
        )


class DraftSubtypeData(SubtypeData):
    entries: List[DraftEntry]
    target_plant_phenology: Optional[DraftTargetPlantPhenologyOut] = None

    @staticmethod
    def resolve_entries(obj: DraftActivity):
        return DraftTerrestrialBiocontrolCollectionEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("invasive_plant", "biocontrol_agent")

    @staticmethod
    def resolve_target_plant_phenology(
        obj: DraftActivity,
    ) -> Optional[DraftTargetPlantPhenologyOut]:
        return DraftTargetPlantPhenology.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()

    @staticmethod
    def resolve_microsite_details(obj: DraftActivity):
        return (
            DraftMicrositeCondition.objects.filter(
                activity_data_record__activity_id=obj.id
            )
            .select_related("mesoslope_position", "site_surface_shape")
            .first()
        )

    @staticmethod
    def resolve_weather_conditions(obj: DraftActivity):
        return (
            DraftWeatherConditions.objects.filter(
                activity_data_record__activity_id=obj.id
            )
            .select_related("cloud_cover", "precipitation", "wind_direction")
            .first()
        )


##########
# Subtypes
####


class BiocontrolCollectionOut(BaseRecordOut):
    subtype: Literal["Biocontrol_Collection"]
    subtype_data: SubtypeData


class DraftBiocontrolCollectionOut(DraftBaseRecordOut):
    subtype: Literal["Biocontrol_Collection"]
    subtype_data: DraftSubtypeData
