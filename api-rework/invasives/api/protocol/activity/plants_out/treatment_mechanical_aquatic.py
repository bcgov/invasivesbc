from . import BaseRecordOut, DraftBaseRecordOut
from typing import Optional, List, Literal
from .common import ShorelineType

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
from ninja import Schema

type EntryType = AquaticPlantMechanicalTreatmentEntry | DraftAquaticPlantMechanicalTreatmentEntry


##########
# Shared
####
class Entry(Schema):
    disposed_material_amount: Optional[float] = None
    disposed_material_format: Optional[str] = None
    disposal_method: Optional[str] = None
    invasive_plant: Optional[str] = None
    mechanical_method: Optional[str] = None
    treated_area_msq: Optional[float] = None

    @staticmethod
    def resolve_disposal_method(obj: EntryType):
        return obj.disposal_method.code if obj.disposal_method else None

    @staticmethod
    def resolve_invasive_plant(obj: EntryType):
        return obj.invasive_plant.code if obj.invasive_plant else None

    @staticmethod
    def resolve_mechanical_method(obj: EntryType):
        return obj.mechanical_method.code if obj.mechanical_method else None


##########
# Regular
####


class SubtypeData(Schema):
    authorization_information: Optional[str] = None
    entries: List[Entry]
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

    @staticmethod
    def resolve_subtype_data(obj: Activity):
        return obj


class DraftTreatmentMechanicalAquaticPlantOut(DraftBaseRecordOut):
    subtype: Literal["Treatment_Mechanical_Plant_Aquatic"]
    subtype_data: DraftSubtypeData

    @staticmethod
    def resolve_subtype_data(obj: DraftActivity):
        return obj
