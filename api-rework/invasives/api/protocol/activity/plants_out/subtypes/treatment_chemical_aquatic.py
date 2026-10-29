from . import BaseRecordOut, DraftBaseRecordOut
from typing import Optional, List, Literal
from itertools import chain
from api.models.activity import (
    Activity,
    DraftActivity,
    ChemTreatmentContext,
    ChemicalTreatmentContext,
    DraftChemTreatmentContext,
    DraftChemicalTreatmentContext,
    WellEntry,
    DraftChemPlantEntryAquatic,
    DraftWellEntry,
    ChemPlantEntryAquatic,
    LiquidHerbicideEntry,
    GranularHerbicideEntry,
    DraftLiquidHerbicideEntry,
    DraftGranularHerbicideEntry,
)
from .common import (
    ChemicalTreatmentContextOut,
    HerbicideOut,
    PlantTreatedOut,
    WellEntryOut,
)
from ninja import Schema


##########
# Regular
####
class TreatmentContextOut(Schema):
    application_method: Optional[str]  #
    tank_mix: Optional[bool]
    calculation_type: Optional[str]  #
    area_treated_sqm: Optional[float]
    amount_mix_used_l: Optional[float]
    delivery_rate: Optional[float]
    dilution_percent: Optional[float]
    herbicide: List[HerbicideOut]
    plants_treated: List[PlantTreatedOut]

    @staticmethod
    def resolve_application_method(obj):
        obj.application_method.code if obj.application_method else None

    @staticmethod
    def resolve_herbicide(obj):
        l = LiquidHerbicideEntry.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        g = GranularHerbicideEntry.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return list(chain(l, g))

    @staticmethod
    def resolve_plants_treated(obj) -> List[PlantTreatedOut]:
        return ChemPlantEntryAquatic.objects.filter(
            activity_data_record=obj.activity_data_record
        )


class SubtypeData(Schema):
    well_entries: List[WellEntryOut]
    treatment_context: TreatmentContextOut
    context: ChemicalTreatmentContextOut

    @staticmethod
    def resolve_well_entries(obj: Activity) -> List[WellEntryOut]:
        return WellEntry.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_context(obj: Activity) -> TreatmentContextOut:
        return ChemicalTreatmentContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()

    @staticmethod
    def resolve_treatment_context(obj: Activity) -> ChemicalTreatmentContext:
        return ChemTreatmentContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()


##########
# Draft
####
class DraftTreatmentContextOut(TreatmentContextOut):
    @staticmethod
    def resolve_herbicide(obj):
        l = DraftLiquidHerbicideEntry.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        g = DraftGranularHerbicideEntry.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return list(chain(l, g))

    @staticmethod
    def resolve_plants_treated(obj) -> List[PlantTreatedOut]:
        return DraftChemPlantEntryAquatic.objects.filter(
            activity_data_record=obj.activity_data_record
        )


class DraftSubtypeData(SubtypeData, Schema):
    treatment_context: DraftTreatmentContextOut

    @staticmethod
    def resolve_well_entries(obj: DraftActivity):
        return DraftWellEntry.objects.filter(activity_data_record__activity_id=obj.id)

    @staticmethod
    def resolve_context(obj: Activity) -> TreatmentContextOut:
        return DraftChemicalTreatmentContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()

    @staticmethod
    def resolve_treatment_context(obj: Activity) -> ChemicalTreatmentContext:
        return DraftChemTreatmentContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()


##########
# Subtypes
####


class TreatmentChemicalAquaticOut(BaseRecordOut):
    subtype: Literal["Treatment_Chemical_Plant_Aquatic"]
    subtype_data: SubtypeData


class DraftTreatmentChemicalAquaticOut(DraftBaseRecordOut):
    subtype: Literal["Treatment_Chemical_Plant_Aquatic"]
    subtype_data: DraftSubtypeData
