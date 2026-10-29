from . import BaseRecordOut, DraftBaseRecordOut, _get_codes
from typing import Optional, List, Literal
from datetime import datetime
from api.models.activity import (
    Activity,
    DraftActivity,
    TerrestrialBiocontrolDispersalMonitoringEntry,
    DraftTerrestrialBiocontrolDispersalMonitoringEntry,
    LocationBiocontrolAgentsFoundTerrestrial,
    DraftLocationBiocontrolAgentsFoundTerrestrial,
    SignOfBiocontrolPresenceTerrestrial,
    DraftSignOfBiocontrolPresenceTerrestrial,
)
from .common import (
    TargetPlantPhenologyOutMixin,
    DraftTargetPlantPhenologyOutMixin,
    WeatherConditionsOutMixin,
    DraftWeatherConditionsOutMixin,
    MicrositeConditionOutMixin,
    DraftMicrositeConditionOutMixin,
    ExtendedAgentCountOutMixin,
    DraftExtendedAgentCountOutMixin,
)
from ninja import Schema

##########
# Regular
####


class Entries(ExtendedAgentCountOutMixin, Schema):
    biocontrol_agent: Optional[str]
    biocontrol_present: Optional[bool]
    invasive_plant: Optional[str]
    historical_iapp_site: Optional[int]
    monitoring_type: Optional[str]
    plant_count: Optional[int]
    monitoring_method: Optional[str]
    count_duration_minutes: Optional[int]
    location_agent_found: List[str]
    number_of_sweeps: Optional[str]
    sign_of_biocontrol_presence: List[str]
    start_time: Optional[datetime]
    stop_time: Optional[datetime]
    linear_segment: Optional[str]
    suitable_for_collection: Optional[str]

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
    def resolve_monitoring_method(obj):
        return obj.monitoring_method.code if obj.monitoring_method else None

    @staticmethod
    def resolve_location_agent_found(obj) -> List[str]:
        return _get_codes(
            LocationBiocontrolAgentsFoundTerrestrial,
            obj.activity_data_record,
            "location_agent_found",
        )

    @staticmethod
    def resolve_sign_of_biocontrol_presence(obj) -> List[str]:
        return _get_codes(
            SignOfBiocontrolPresenceTerrestrial,
            obj.activity_data_record,
            "sign_of_presence",
        )


class SubtypeData(
    MicrositeConditionOutMixin,
    WeatherConditionsOutMixin,
    TargetPlantPhenologyOutMixin,
    Schema,
):
    entries: List[Entries]

    @staticmethod
    def resolve_entries(obj: Activity):
        return TerrestrialBiocontrolDispersalMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )


##########
# Draft
####
class DraftEntries(DraftExtendedAgentCountOutMixin, Entries):
    @staticmethod
    def resolve_location_agent_found(obj: DraftActivity) -> List[str]:
        return _get_codes(
            DraftLocationBiocontrolAgentsFoundTerrestrial,
            obj.activity_data_record,
            "location_agent_found",
        )

    @staticmethod
    def resolve_sign_of_biocontrol_presence(obj) -> List[str]:
        return _get_codes(
            DraftSignOfBiocontrolPresenceTerrestrial,
            obj.activity_data_record,
            "sign_of_presence",
        )


class DraftSubtypeData(
    DraftMicrositeConditionOutMixin,
    DraftWeatherConditionsOutMixin,
    DraftTargetPlantPhenologyOutMixin,
    Schema,
):
    entries: List[DraftEntries]

    @staticmethod
    def resolve_entries(obj: DraftActivity):
        return DraftTerrestrialBiocontrolDispersalMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )


##########
# Subtypes
####


class BiocontrolReleaseMonitoringOut(BaseRecordOut):
    subtype: Literal["Monitoring_Biocontrol_Release_Plant_Terrestrial"]
    subtype_data: SubtypeData


class DraftBiocontrolReleaseMonitoringOut(DraftBaseRecordOut):
    subtype: Literal["Monitoring_Biocontrol_Release_Plant_Terrestrial"]
    subtype_data: DraftSubtypeData
