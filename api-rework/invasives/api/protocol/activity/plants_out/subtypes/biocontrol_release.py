from . import BaseRecordOut, DraftBaseRecordOut
from typing import Optional, List, Literal
from datetime import datetime
from api.models.activity import (
    Activity,
    DraftActivity,
    TerrestrialBiocontrolReleaseEntry,
    DraftTerrestrialBiocontrolReleaseEntry,
)
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

from ninja import Schema

type Entry = TerrestrialBiocontrolReleaseEntry | DraftTerrestrialBiocontrolReleaseEntry

##########
# Shared
####


##########
# Regular
####
class Entries(SimpleAgentCountOutMixin, Schema):
    agent_source: Optional[str]
    biocontrol_agent: Optional[str]
    collection_date: Optional[datetime]
    linear_segment: Optional[str]
    invasive_plant: Optional[str]
    mortality: Optional[int]
    plant_collected_from: Optional[str]
    plant_collected_from_manual: Optional[str]

    @staticmethod
    def resolve_invasive_plant(obj: Entry):
        return obj.invasive_plant.code if obj.invasive_plant else None

    @staticmethod
    def resolve_biocontrol_agent(obj: Entry):
        return obj.biocontrol_agent.code if obj.biocontrol_agent else None

    @staticmethod
    def resolve_plant_collected_from(obj: Entry):
        return obj.plant_collected_from.code if obj.plant_collected_from else None


class SubtypeData(
    WeatherConditionsOutMixin,
    TargetPlantPhenologyOutMixin,
    MicrositeConditionOutMixin,
    Schema,
):
    entries: List[Entries]

    @staticmethod
    def resolve_entries(obj: Activity):
        return TerrestrialBiocontrolReleaseEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("invasive_plant", "biocontrol_agent", "plant_collected_from")


##########
# Draft
####
class DraftEntries(DraftSimpleAgentCountOutMixin, Entries):
    pass


class DraftSubtypeData(
    DraftTargetPlantPhenologyOutMixin,
    DraftMicrositeConditionOutMixin,
    DraftWeatherConditionsOutMixin,
    Schema,
):
    entries: List[DraftEntries]

    @staticmethod
    def resolve_entries(obj: DraftActivity) -> List[DraftEntries]:
        return DraftTerrestrialBiocontrolReleaseEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("invasive_plant", "biocontrol_agent", "plant_collected_from")


##########
# Subtypes
####


class BiocontrolReleaseOut(BaseRecordOut):
    subtype: Literal["Biocontrol_Release"]
    subtype_data: SubtypeData


class DraftBiocontrolReleaseOut(DraftBaseRecordOut):
    subtype: Literal["Biocontrol_Release"]
    subtype_data: DraftSubtypeData
