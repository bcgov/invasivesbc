from ninja import Schema
from typing import Optional, List, Literal

from . import BaseRecordOut, DraftBaseRecordOut
from .common import ShorelineType, MechanicalTreatmentEntryOut
from api.models.activity import (
    Activity,
    DraftActivity,
    TerrestrialPlantMechanicalTreatmentEntry,
    DraftTerrestrialPlantMechanicalTreatmentEntry,
)

type EntryType = TerrestrialPlantMechanicalTreatmentEntry | DraftTerrestrialPlantMechanicalTreatmentEntry


##########
# Regular
####
class SubtypeData(Schema):
    authorization_information: Optional[str] = None
    entries: List[MechanicalTreatmentEntryOut]
    shoreline_types: List[ShorelineType]

    @staticmethod
    def resolve_entries(obj: Activity):
        return TerrestrialPlantMechanicalTreatmentEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )


##########
# Draft
####
class DraftSubtypeData(SubtypeData):
    @staticmethod
    def resolve_entries(obj: DraftActivity):
        return DraftTerrestrialPlantMechanicalTreatmentEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )


##########
# Subtypes
####
class TreatmentMechanicalTerrestrialPlantOut(BaseRecordOut):
    subtype: Literal["Treatment_Mechanical_Plant_Terrestrial"]
    subtype_data: SubtypeData


class DraftTreatmentMechanicalTerrestrialPlantOut(DraftBaseRecordOut):
    subtype: Literal["Treatment_Mechanical_Plant_Terrestrial"]
    subtype_data: DraftSubtypeData
