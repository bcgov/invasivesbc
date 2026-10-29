from ninja import Schema
from typing import Optional, List, Literal

from . import BaseRecordOut, DraftBaseRecordOut, _get_codes
from .common import VoucherSpecimenOut, ShorelineType
from api.models.activity import (
    Activity,
    DraftActivity,
    AquaticVoucherSpecimen,
    AquaticPlantObservationContext,
    AquaticPlantObservationEntry,
    DraftAquaticVoucherSpecimen,
    DraftAquaticPlantObservationContext,
    DraftAquaticPlantObservationEntry,
    PretreatmentObservation,
    DraftPretreatmentObservation,
    WaterbodyAdjacentLandUse,
    WaterbodyContext,
    WaterbodyInflowPermanent,
    WaterbodyInflowSeasonal,
    WaterbodyLevelManagement,
    WaterbodyOutflowPermanent,
    WaterbodyOutflowSeasonal,
    WaterbodySubstrateType,
    DraftWaterbodyInflowPermanent,
    DraftWaterbodyInflowSeasonal,
    DraftWaterbodyLevelManagement,
    DraftWaterbodyOutflowPermanent,
    DraftWaterbodyOutflowSeasonal,
    DraftWaterbodySubstrateType,
    DraftWaterbodyAdjacentLandUse,
    WaterbodyUse,
    DraftWaterbodyUse,
    DraftWaterbodyContext,
    ShorelineTypes,
    DraftShorelineTypes,
)

type Entry = AquaticPlantObservationEntry | DraftAquaticPlantObservationEntry
type Ctx = AquaticPlantObservationContext | DraftAquaticPlantObservationContext
type WbCtx = WaterbodyContext | DraftWaterbodyContext


##########
# Regular
####
class Context(Schema):
    suitable_for_biocontrol: str


class WbContext(Schema):
    access: Optional[str]
    colour: Optional[str]
    comment: Optional[str]
    max_depth_m: Optional[int]
    name_gazetted: Optional[str]
    name_local: Optional[str]
    secchi_depth: Optional[int]
    tidal_influence: Optional[str]
    type: str
    inflow_permanent: List[str]
    inflow_seasonal: List[str]
    outflow_permanent: List[str]
    outflow_seasonal: List[str]
    water_use: List[str]
    waterlevel_management: List[str]
    shoreline_types: List[ShorelineType]

    @staticmethod
    def resolve_type(obj: WbCtx):
        return obj.type.code if obj.type else None

    @staticmethod
    def resolve_inflow_permanent(obj: WbCtx):
        return _get_codes(
            model=WaterbodyInflowPermanent,
            adr=obj.activity_data_record,
            field="flow_code__code",
        )

    @staticmethod
    def resolve_inflow_seasonal(obj: WbCtx):
        return _get_codes(
            model=WaterbodyInflowSeasonal,
            adr=obj.activity_data_record,
            field="flow_code__code",
        )

    @staticmethod
    def resolve_outflow_permanent(obj: WbCtx):
        return _get_codes(
            model=WaterbodyOutflowPermanent,
            adr=obj.activity_data_record,
            field="flow_code__code",
        )

    @staticmethod
    def resolve_outflow_seasonal(obj: WbCtx):
        return _get_codes(
            model=WaterbodyOutflowSeasonal,
            adr=obj.activity_data_record,
            field="flow_code__code",
        )

    @staticmethod
    def resolve_water_use(obj: WbCtx):
        return _get_codes(
            model=WaterbodyUse,
            adr=obj.activity_data_record,
            field="waterbody_use__code",
        )

    @staticmethod
    def resolve_waterlevel_management(obj: WbCtx):
        return _get_codes(
            model=WaterbodyLevelManagement,
            adr=obj.activity_data_record,
            field="waterlevel_management__code",
        )

    @staticmethod
    def resolve_shoreline_types(obj: WbCtx):
        return ShorelineTypes.objects.filter(
            activity_data_record=obj.activity_data_record
        ).select_related("shoreline_type")


class Entries(Schema):
    sample_point_id: Optional[str] = None
    density: Optional[str]
    distribution: Optional[str]
    invasive_plant: str
    life_stage: Optional[str]
    observation_type: str
    voucher_specimen: Optional[VoucherSpecimenOut] = None

    # Since 'dot.notation' will lead to an error if empty, serialize through resolvers.
    @staticmethod
    def resolve_voucher_specimen(obj: Entry):
        return AquaticVoucherSpecimen.objects.filter(
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
    waterbody_context: WbContext
    adjacent_land_use: List[str]
    substrate_type: List[str]

    @staticmethod
    def resolve_adjacent_land_use(obj: Activity):
        return WaterbodyAdjacentLandUse.objects.filter(
            activity_data_record__activity_id=obj.id
        ).values_list("waterbody_adjacent_land_use__code", flat=True)

    @staticmethod
    def resolve_entries(obj: Activity):
        return AquaticPlantObservationEntry.objects.filter(
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
        return AquaticPlantObservationContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()

    @staticmethod
    def resolve_waterbody_context(obj: Activity):
        return WaterbodyContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()

    @staticmethod
    def resolve_substrate_type(obj: Activity):
        return WaterbodySubstrateType.objects.filter(
            activity_data_record__activity_id=obj.id
        ).values_list("substrate_type__code")


##########
# Draft
####


class DraftWbContext(WbContext):
    type: Optional[str]

    @staticmethod
    def resolve_type(obj: WbCtx):
        return obj.type.code if obj.type else None

    @staticmethod
    def resolve_inflow_permanent(obj: WbCtx):
        return _get_codes(
            model=DraftWaterbodyInflowPermanent,
            adr=obj.activity_data_record,
            field="flow_code__code",
        )

    @staticmethod
    def resolve_inflow_seasonal(obj: WbCtx):
        return _get_codes(
            model=DraftWaterbodyInflowSeasonal,
            adr=obj.activity_data_record,
            field="flow_code__code",
        )

    @staticmethod
    def resolve_outflow_permanent(obj: WbCtx):
        return _get_codes(
            model=DraftWaterbodyOutflowPermanent,
            adr=obj.activity_data_record,
            field="flow_code__code",
        )

    @staticmethod
    def resolve_outflow_seasonal(obj: WbCtx):
        return _get_codes(
            model=DraftWaterbodyOutflowSeasonal,
            adr=obj.activity_data_record,
            field="flow_code__code",
        )

    @staticmethod
    def resolve_water_use(obj: WbCtx):
        return _get_codes(
            model=DraftWaterbodyUse,
            adr=obj.activity_data_record,
            field="waterbody_use__code",
        )

    @staticmethod
    def resolve_waterlevel_management(obj: WbCtx):
        return _get_codes(
            model=DraftWaterbodyLevelManagement,
            adr=obj.activity_data_record,
            field="waterlevel_management__code",
        )

    @staticmethod
    def resolve_shoreline_types(obj: WbCtx):
        return DraftShorelineTypes.objects.filter(
            activity_data_record=obj.activity_data_record
        ).select_related("shoreline_type")


class DraftContext(Context):
    suitable_for_biocontrol: Optional[str]


class DraftEntries(Entries):
    invasive_plant: Optional[str]
    observation_type: Optional[str] = None

    @staticmethod
    def resolve_voucher_specimen(obj: DraftActivity):
        return DraftAquaticVoucherSpecimen.objects.filter(
            activity_data_record_id__id=obj.activity_data_record.id
        ).first()


class DraftSubtypeData(SubtypeData):
    adjacent_land_use: List[str]
    context: Optional[DraftContext]
    entries: List[DraftEntries]
    pretreatment_observation: Optional[str]
    waterbody_context: Optional[DraftWbContext]
    substrate_type: List[str]

    @staticmethod
    def resolve_adjacent_land_use(obj: DraftActivity):
        return DraftWaterbodyAdjacentLandUse.objects.filter(
            activity_data_record__activity_id=obj.id
        ).values_list("waterbody_adjacent_land_use__code", flat=True)

    @staticmethod
    def resolve_entries(obj: DraftActivity):
        return DraftAquaticPlantObservationEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        ).select_related("density", "distribution", "invasive_plant", "life_stage")

    @staticmethod
    def resolve_pretreatment_observation(obj: DraftActivity):
        return (
            DraftPretreatmentObservation.objects.filter(
                activity_data_record__activity_id=obj.id
            )
            .values_list("pre_treatment_observation", flat=True)
            .first()
        )

    @staticmethod
    def resolve_context(obj: DraftActivity):
        return DraftAquaticPlantObservationContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()

    @staticmethod
    def resolve_waterbody_context(obj: DraftActivity):
        return DraftWaterbodyContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()

    @staticmethod
    def resolve_substrate_type(obj: DraftActivity):
        return DraftWaterbodySubstrateType.objects.filter(
            activity_data_record__activity_id=obj.id
        ).values_list("substrate_type__code", flat=True)


##########
# Subtypes
####
class ObservationAquaticPlantOut(BaseRecordOut):
    subtype: Literal["Observation_Plant_Aquatic"]
    subtype_data: SubtypeData


class DraftObservationAquaticPlantOut(DraftBaseRecordOut):
    subtype: Literal["Observation_Plant_Aquatic"]
    subtype_data: DraftSubtypeData
