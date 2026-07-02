from api.models.activity import (
    AquaticPlantObservationContext,
    AquaticPlantObservationEntry,
    PretreatmentObservation,
    ActivityDataRecord,
    AquaticVoucherSpecimen,
    Activity,
    WaterbodyAdjacentLandUse,
    ShorelineTypes,
    WaterbodyUse,
    WaterbodySubstrateType,
    WaterbodyContext,
    WaterbodyInflowPermanent,
    WaterbodyInflowSeasonal,
    WaterbodyOutflowPermanent,
    WaterbodyOutflowSeasonal,
    WaterbodyLevelManagement,
    DraftAquaticPlantObservationContext,
    DraftAquaticPlantObservationEntry,
    DraftPretreatmentObservation,
    DraftActivityDataRecord,
    DraftAquaticVoucherSpecimen,
    DraftActivity,
    DraftWaterbodyAdjacentLandUse,
    DraftShorelineTypes,
    DraftWaterbodyUse,
    DraftWaterbodySubstrateType,
    DraftWaterbodyContext,
    DraftWaterbodyInflowPermanent,
    DraftWaterbodyInflowSeasonal,
    DraftWaterbodyOutflowPermanent,
    DraftWaterbodyOutflowSeasonal,
    DraftWaterbodyLevelManagement,
)
from . import BaseActivityProcessor, DraftBaseActivityProcessor


class PlantObservationAquaticIn(BaseActivityProcessor):
    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)

        AquaticPlantObservationContext.objects.create(
            activity_data_record=adr, **subtype_data.get("context", None)
        )

        PretreatmentObservation.objects.create(
            activity_data_record=adr,
            pre_treatment_observation=subtype_data.get(
                "pretreatment_observation", None
            ),
        )

        wb_context: dict = subtype_data.get("waterbody_context", None)

        WaterbodyInflowPermanent.objects.bulk_create(
            WaterbodyInflowPermanent(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("inflow_permanent", [])
        )
        WaterbodyInflowSeasonal.objects.bulk_create(
            WaterbodyInflowSeasonal(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("inflow_seasonal", [])
        )
        WaterbodyOutflowPermanent.objects.bulk_create(
            WaterbodyOutflowPermanent(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("outflow_permanent", [])
        )
        WaterbodyOutflowSeasonal.objects.bulk_create(
            WaterbodyOutflowSeasonal(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("outflow_seasonal", [])
        )
        WaterbodyContext.objects.create(activity_data_record=adr, **wb_context)

        # Populate 1:M Arrays of strings
        ShorelineTypes.objects.bulk_create(
            ShorelineTypes(activity_data_record=adr, **shoreline_type)
            for shoreline_type in subtype_data.get("shoreline_types", [])
        )

        WaterbodyUse.objects.bulk_create(
            WaterbodyUse(activity_data_record=adr, waterbody_use=code)
            for code in subtype_data.get("water_use", [])
        )
        WaterbodySubstrateType.objects.bulk_create(
            WaterbodySubstrateType(activity_data_record=adr, substrate_type=code)
            for code in subtype_data.get("substrate_type", [])
        )
        WaterbodyAdjacentLandUse.objects.bulk_create(
            WaterbodyAdjacentLandUse(
                activity_data_record=adr, waterbody_adjacent_land_use=code
            )
            for code in subtype_data.get("adjacent_land_use", [])
        )
        WaterbodyLevelManagement.objects.bulk_create(
            WaterbodyLevelManagement(
                activity_data_record=adr, waterlevel_management=code
            )
            for code in subtype_data.get("waterlevel_management", [])
        )

        # Aquatic Entries
        for entry in subtype_data.get("entries", []):
            adr = ActivityDataRecord.objects.create(activity=parent)

            voucher_data = entry.pop("voucher_specimen", None)
            if voucher_data:
                AquaticVoucherSpecimen.objects.create(
                    activity_data_record=adr,
                    invasive_plant=entry["invasive_plant"],
                    **voucher_data
                )
            AquaticPlantObservationEntry.objects.create(
                activity_data_record=adr, **entry
            )


class DraftPlantObservationAquaticIn(DraftBaseActivityProcessor):
    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: DraftActivity):
        adr = DraftActivityDataRecord.objects.create(activity=parent)

        DraftAquaticPlantObservationContext.objects.create(
            activity_data_record=adr, **subtype_data.get("context", None)
        )

        DraftPretreatmentObservation.objects.create(
            activity_data_record=adr,
            pre_treatment_observation=subtype_data.get(
                "pretreatment_observation", None
            ),
        )

        wb_context: dict = subtype_data.get("waterbody_context", None)

        DraftWaterbodyInflowPermanent.objects.bulk_create(
            DraftWaterbodyInflowPermanent(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("inflow_permanent", [])
        )
        DraftWaterbodyInflowSeasonal.objects.bulk_create(
            DraftWaterbodyInflowSeasonal(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("inflow_seasonal", [])
        )
        DraftWaterbodyOutflowPermanent.objects.bulk_create(
            DraftWaterbodyOutflowPermanent(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("outflow_permanent", [])
        )
        DraftWaterbodyOutflowSeasonal.objects.bulk_create(
            DraftWaterbodyOutflowSeasonal(activity_data_record=adr, flow_code=flow)
            for flow in wb_context.pop("outflow_seasonal", [])
        )
        DraftWaterbodyContext.objects.create(activity_data_record=adr, **wb_context)

        # Populate 1:M Arrays of strings
        DraftShorelineTypes.objects.bulk_create(
            DraftShorelineTypes(activity_data_record=adr, **shoreline_type)
            for shoreline_type in subtype_data.get("shoreline_types", [])
        )

        DraftWaterbodyUse.objects.bulk_create(
            DraftWaterbodyUse(activity_data_record=adr, waterbody_use=code)
            for code in subtype_data.get("water_use", [])
        )
        DraftWaterbodySubstrateType.objects.bulk_create(
            DraftWaterbodySubstrateType(activity_data_record=adr, substrate_type=code)
            for code in subtype_data.get("substrate_type", [])
        )
        DraftWaterbodyAdjacentLandUse.objects.bulk_create(
            DraftWaterbodyAdjacentLandUse(
                activity_data_record=adr, waterbody_adjacent_land_use=code
            )
            for code in subtype_data.get("adjacent_land_use", [])
        )
        DraftWaterbodyLevelManagement.objects.bulk_create(
            DraftWaterbodyLevelManagement(
                activity_data_record=adr, waterlevel_management=code
            )
            for code in subtype_data.get("waterlevel_management", [])
        )

        # Aquatic Entries
        for entry in subtype_data.get("entries", []):
            adr = DraftActivityDataRecord.objects.create(activity=parent)

            voucher_data = entry.pop("voucher_specimen", None)
            if voucher_data:
                DraftAquaticVoucherSpecimen.objects.create(
                    activity_data_record=adr,
                    invasive_plant=entry["invasive_plant"],
                    **voucher_data
                )
            DraftAquaticPlantObservationEntry.objects.create(
                activity_data_record=adr, **entry
            )
