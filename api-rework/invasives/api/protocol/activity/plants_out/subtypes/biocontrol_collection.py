from typing import Optional, List, Literal
from datetime import datetime
from ninja import Schema

from . import BaseRecordOut, DraftBaseRecordOut, _serialize_html_date_time
from .common import (
    TargetPlantPhenologyOutMixin,
    DraftTargetPlantPhenologyOutMixin,
    WeatherConditionsOutMixin,
    DraftWeatherConditionsOutMixin,
    MicrositeConditionOutMixin,
    DraftMicrositeConditionOutMixin,
    SimpleAgentCountOutMixin,
    DraftSimpleAgentCountOutMixin,
)
from api.models.activity import (
    Activity,
    DraftActivity,
    TerrestrialBiocontrolCollectionEntry,
    DraftTerrestrialBiocontrolCollectionEntry,
)


##########
# Shared
####
class Entry(SimpleAgentCountOutMixin, Schema):
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

    @staticmethod
    def resolve_start_time_collecting(obj: Entry):
        return _serialize_html_date_time(obj.start_time_collecting)

    @staticmethod
    def resolve_end_time_collecting(obj: Entry):
        return _serialize_html_date_time(obj.end_time_collecting)

    @staticmethod
    def resolve_invasive_plant(obj: Entry):
        return obj.invasive_plant.code if obj.invasive_plant else None

    @staticmethod
    def resolve_biocontrol_agent(obj: Entry):
        return obj.biocontrol_agent.code if obj.biocontrol_agent else None

    @staticmethod
    def resolve_collection_method(obj: Entry):
        return obj.collection_method.code if obj.collection_method else None


##########
# Regular
####
class SubtypeData(
    TargetPlantPhenologyOutMixin,
    MicrositeConditionOutMixin,
    WeatherConditionsOutMixin,
    Schema,
):
    entries: List[Entry]

    @staticmethod
    def resolve_entries(obj: Activity):
        return TerrestrialBiocontrolCollectionEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("invasive_plant", "biocontrol_agent")


##########
# Draft
####
class DraftEntry(DraftSimpleAgentCountOutMixin, Entry, Schema):
    pass


class DraftSubtypeData(
    DraftTargetPlantPhenologyOutMixin,
    DraftWeatherConditionsOutMixin,
    DraftMicrositeConditionOutMixin,
    Schema,
):
    entries: List[DraftEntry]

    @staticmethod
    def resolve_entries(obj: DraftActivity):
        return DraftTerrestrialBiocontrolCollectionEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("invasive_plant", "biocontrol_agent")


##########
# Subtypes
####


class BiocontrolCollectionOut(BaseRecordOut):
    subtype: Literal["Biocontrol_Collection"]
    subtype_data: SubtypeData


class DraftBiocontrolCollectionOut(DraftBaseRecordOut):
    subtype: Literal["Biocontrol_Collection"]
    subtype_data: DraftSubtypeData
