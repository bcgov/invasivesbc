from ninja import Schema
from typing import Optional, List, Literal

from . import BaseRecordOut, DraftBaseRecordOut
from .common import ShorelineType, MechanicalTreatmentEntryOut
from api.models.activity import (
    Activity,
    DraftActivity,
    AquaticPlantMechanicalTreatmentEntry,
    AquaticMechanicalAuthorization,
    ShorelineTypes,
    DraftAquaticPlantMechanicalTreatmentEntry,
    DraftAquaticMechanicalAuthorization,
    DraftShorelineTypes,
)

type EntryType = AquaticPlantMechanicalTreatmentEntry | DraftAquaticPlantMechanicalTreatmentEntry

##########
# Regular
####


class SubtypeData(Schema):
    authorization_information: Optional[str] = None
    entries: List[MechanicalTreatmentEntryOut]
    shoreline_types: List[ShorelineType]

    @staticmethod
    def resolve_entries(obj: Activity):
        return AquaticPlantMechanicalTreatmentEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )

    @staticmethod
    def resolve_shoreline_types(obj: Activity) -> List[ShorelineType]:
        return ShorelineTypes.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_authorization_information(obj: Activity) -> Optional[str]:
        return (
            AquaticMechanicalAuthorization.objects.filter(
                activity_data_record__activity_id=obj.id
            )
            .values_list("authorization_information", flat=True)
            .first()
        )


##########
# Draft
####
class DraftSubtypeData(SubtypeData):
    @staticmethod
    def resolve_entries(obj: DraftActivity):
        return DraftAquaticPlantMechanicalTreatmentEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )

    @staticmethod
    def resolve_shoreline_types(obj: DraftActivity) -> List[ShorelineType]:
        return DraftShorelineTypes.objects.filter(
            activity_data_record__activity_id=obj.id
        )

    @staticmethod
    def resolve_authorization_information(obj: DraftActivity) -> Optional[str]:
        return (
            DraftAquaticMechanicalAuthorization.objects.filter(
                activity_data_record__activity_id=obj.id
            )
            .values_list("authorization_information", flat=True)
            .first()
        )


##########
# Subtypes
####
class TreatmentMechanicalAquaticPlantOut(BaseRecordOut):
    subtype: Literal["Treatment_Mechanical_Plant_Aquatic"]
    subtype_data: SubtypeData


class DraftTreatmentMechanicalAquaticPlantOut(DraftBaseRecordOut):
    subtype: Literal["Treatment_Mechanical_Plant_Aquatic"]
    subtype_data: DraftSubtypeData
