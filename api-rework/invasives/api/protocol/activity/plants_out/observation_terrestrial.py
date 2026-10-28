from . import BaseRecordOut, DraftBaseRecordOut
from typing import Optional, List, Literal
from .common import VoucherSpecimenOut
from api.models.activity import (
    Activity,
    DraftActivity,
    TerrestrialVoucherSpecimen,
    TerrestrialPlantObservationContext,
    TerrestrialPlantObservationEntries,
    DraftTerrestrialVoucherSpecimen,
    DraftTerrestrialPlantObservationContext,
    DraftTerrestrialPlantObservationEntries,
    PretreatmentObservation,
    DraftPretreatmentObservation,
    SpecificUse,
    DraftSpecificUse,
)
from ninja import Schema

type Entry = TerrestrialPlantObservationEntries | DraftTerrestrialPlantObservationEntries
type Ctx = TerrestrialPlantObservationContext | DraftTerrestrialPlantObservationContext
type SpUse = SpecificUse | DraftSpecificUse


##########
# Shared
####
class SpecificUseOut(Schema):
    specific_use: Optional[str]

    @staticmethod
    def resolve_specific_use(obj: SpUse):
        return obj.specific_use.code if obj.specific_use else None


##########
# Regular
####
class Context(Schema):
    aspect: Optional[str]
    research_observation: Optional[str]
    slope_percent: Optional[str]
    soil_texture: Optional[str]
    specific_uses: List[SpecificUseOut]
    suitable_for_biocontrol_agent: Optional[str]
    visible_well_nearby: Optional[str]

    @staticmethod
    def resolve_aspect(obj: Ctx):
        return obj.aspect.code if obj.aspect else None

    @staticmethod
    def resolve_slope_percent(obj: Ctx):
        return obj.slope_percent.code if obj.slope_percent else None

    @staticmethod
    def resolve_soil_texture(obj: Ctx):
        return obj.soil_texture.code if obj.soil_texture else None

    @staticmethod
    def resolve_specific_uses(obj: Ctx):
        return SpecificUse.objects.filter(
            activity_data_record__id=obj.activity_data_record.id,
            specific_use__isnull=False,
        ).select_related("specific_use")


class Entries(Schema):
    density: Optional[str]
    distribution: Optional[str]
    invasive_plant: str
    life_stage: Optional[str]
    observation_type: str
    voucher_specimen: Optional[VoucherSpecimenOut] = None

    # Since 'dot.notation' will lead to an error if empty, serialize through resolvers.
    @staticmethod
    def resolve_voucher_specimen(obj: Entry):
        return TerrestrialVoucherSpecimen.objects.filter(
            activity_data_record_id__id=obj.activity_data_record.id
        ).first()

    @staticmethod
    def resolve_density(obj: Entry) -> str | None:
        return obj.density.code if obj.density else None

    @staticmethod
    def resolve_distribution(obj: Entry) -> str | None:
        return obj.distribution.code if obj.distribution else None

    @staticmethod
    def resolve_invasive_plant(obj: Entry) -> str | None:
        return obj.invasive_plant.code if obj.invasive_plant else None

    @staticmethod
    def resolve_life_stage(obj: Entry) -> str | None:
        return obj.life_stage.code if obj.life_stage else None


class SubtypeData(Schema):
    context: Context
    entries: List[Entries]
    pretreatment_observation: str

    @staticmethod
    def resolve_entries(obj):
        return TerrestrialPlantObservationEntries.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("density", "distribution", "invasive_plant", "life_stage")

    @staticmethod
    def resolve_pretreatment_observation(obj: Activity):
        return (
            PretreatmentObservation.objects.filter(
                activity_data_record__activity_id=obj.id
            )
            .values_list("pre_treatment_observation", flat=True)
            .first()
        )

    @staticmethod
    def resolve_context(obj: Activity):
        return (
            TerrestrialPlantObservationContext.objects.filter(
                activity_data_record__activity_id=obj.id
            )
            .select_related()
            .first()
        )


##########
# Draft
####


class DraftContext(Context):
    @staticmethod
    def resolve_specific_uses(obj: Ctx):
        return DraftSpecificUse.objects.filter(
            activity_data_record__id=obj.activity_data_record.id,
            specific_use__isnull=False,
        ).select_related("specific_use")


class DraftEntries(Entries):
    invasive_plant: Optional[str]
    observation_type: Optional[str] = None

    @staticmethod
    def resolve_voucher_specimen(obj: Entry):
        return DraftTerrestrialVoucherSpecimen.objects.filter(
            activity_data_record_id__id=obj.activity_data_record.id
        ).first()


class DraftSubtypeData(SubtypeData):
    context: Optional[DraftContext]
    entries: List[DraftEntries]
    pretreatment_observation: Optional[str]

    @staticmethod
    def resolve_entries(obj):
        return DraftTerrestrialPlantObservationEntries.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("density", "distribution", "invasive_plant", "life_stage")

    @staticmethod
    def resolve_pretreatment_observation(obj: Activity):
        return (
            DraftPretreatmentObservation.objects.filter(
                activity_data_record__activity_id=obj.id
            )
            .values_list("pre_treatment_observation", flat=True)
            .first()
        )

    @staticmethod
    def resolve_context(obj: Activity):
        return (
            DraftTerrestrialPlantObservationContext.objects.filter(
                activity_data_record__activity_id=obj.id
            )
            .select_related("aspect", "slope_percent", "soil_texture")
            .first()
        )


##########
# Subtypes
####
class ObservationTerrestrialPlantOut(BaseRecordOut):
    subtype: Literal["Observation_Plant_Terrestrial"]
    subtype_data: SubtypeData


class DraftObservationTerrestrialPlantOut(DraftBaseRecordOut):
    subtype: Literal["Observation_Plant_Terrestrial"]
    subtype_data: DraftSubtypeData
