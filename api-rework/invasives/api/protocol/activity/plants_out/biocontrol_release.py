from . import BaseRecordOut, DraftBaseRecordOut
from typing import Optional, List, Literal
from datetime import datetime
from .common import (
    MicrositeConditionOut,
    TargetPlantPhenologyOut,
    DraftTargetPlantPhenologyOut,
    WeatherConditionsOut,
    SimpleAgentCountOut,
)
from api.models.activity import (
    Activity,
    DraftActivity,
    TerrestrialBiocontrolReleaseEntry,
    DraftTerrestrialBiocontrolReleaseEntry,
    WeatherConditions,
    DraftWeatherConditions,
    MicrositeCondition,
    DraftMicrositeCondition,
    TargetPlantPhenology,
    DraftTargetPlantPhenology,
    TerrestrialBiocontrolAgentCount,
    DraftTerrestrialBiocontrolAgentCount,
)
from ninja import Schema

type Entry = TerrestrialBiocontrolReleaseEntry | DraftTerrestrialBiocontrolReleaseEntry

##########
# Shared
####


##########
# Regular
####
class Entries(Schema):
    agent_source: Optional[str]
    biocontrol_agent: Optional[str]
    collection_date: Optional[datetime]
    linear_segment: Optional[str]
    invasive_plant: Optional[str]
    mortality: Optional[int]
    plant_collected_from: Optional[str]
    plant_collected_from_manual: Optional[str]
    estimated_biological_agents: List[SimpleAgentCountOut]
    actual_biological_agents: List[SimpleAgentCountOut]

    @staticmethod
    def resolve_invasive_plant(obj: Entry):
        return obj.invasive_plant.code if obj.invasive_plant else None

    @staticmethod
    def resolve_biocontrol_agent(obj: Entry):
        return obj.biocontrol_agent.code if obj.biocontrol_agent else None

    @staticmethod
    def resolve_plant_collected_from(obj: Entry):
        return obj.plant_collected_from.code if obj.plant_collected_from else None

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


class SubtypeData(Schema):
    entries: List[Entries]
    target_plant_phenology: Optional[TargetPlantPhenologyOut] = None
    microsite_details: MicrositeConditionOut
    weather_conditions: WeatherConditionsOut

    @staticmethod
    def resolve_entries(obj: Activity):
        return TerrestrialBiocontrolReleaseEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("invasive_plant", "biocontrol_agent", "plant_collected_from")

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
class DraftEntries(Entries):

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
    target_plant_phenology: Optional[DraftTargetPlantPhenologyOut] = None
    entries: List[DraftEntries]

    @staticmethod
    def resolve_entries(obj: DraftActivity) -> List[DraftEntries]:
        return DraftTerrestrialBiocontrolReleaseEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("invasive_plant", "biocontrol_agent", "plant_collected_from")

    @staticmethod
    def resolve_target_plant_phenology(
        obj: DraftActivity,
    ) -> DraftTargetPlantPhenologyOut:
        return DraftTargetPlantPhenology.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()

    @staticmethod
    def resolve_microsite_details(obj: DraftActivity) -> MicrositeConditionOut:
        return (
            DraftMicrositeCondition.objects.filter(
                activity_data_record__activity_id=obj.id
            )
            .select_related("mesoslope_position", "site_surface_shape")
            .first()
        )

    @staticmethod
    def resolve_weather_conditions(obj: DraftActivity) -> WeatherConditionsOut:
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


class BiocontrolReleaseOut(BaseRecordOut):
    subtype: Literal["Biocontrol_Release"]
    subtype_data: SubtypeData


class DraftBiocontrolReleaseOut(DraftBaseRecordOut):
    subtype: Literal["Biocontrol_Release"]
    subtype_data: DraftSubtypeData
