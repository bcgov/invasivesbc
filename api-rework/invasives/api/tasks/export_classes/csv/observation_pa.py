from . import CsvTransformerBase
from api.models.export.csv import ObservationPlantAquatic
from api.models.activity import (
    AquaticPlantObservationEntry,
    AquaticPlantObservationContext,
    WaterbodyContext,
    WaterbodyAdjacentLandUse,
    WaterbodyInflowPermanent,
    WaterbodyInflowSeasonal,
    WaterbodyLevelManagement,
    WaterbodyOutflowPermanent,
    WaterbodyOutflowSeasonal,
    WaterbodyUse,
    AquaticVoucherSpecimen,
    PretreatmentObservation,
    ShorelineTypes,
    WaterbodySubstrateType,
)
from api.models.enums import YesNo


class ObservationPlantAquaticCsvRow(
    CsvTransformerBase[ObservationPlantAquatic, AquaticPlantObservationEntry]
):
    csv_model = ObservationPlantAquatic
    entry_model = AquaticPlantObservationEntry

    def build_rows(self, common_fields):
        ctx = AquaticPlantObservationContext.objects.get(
            activity_data_record__activity_id=self.id
        )
        pto = PretreatmentObservation.objects.get(
            activity_data_record__activity_id=self.id
        )
        voucher_specimen = AquaticVoucherSpecimen.objects.filter(
            activity_data_record__activity_id=self.id
        ).exists()
        wb_ctx = WaterbodyContext.objects.get(activity_data_record__activity_id=self.id)
        adjacent_land_use = ", ".join(
            WaterbodyAdjacentLandUse.objects.filter(
                activity_data_record__activity_id=self.id
            ).values_list("waterbody_adjacent_land_use__full", flat=True)
        )
        inflow_p = ", ".join(
            WaterbodyInflowPermanent.objects.filter(
                activity_data_record__activity_id=self.id
            ).values_list("flow_code__full", flat=True)
        )
        inflow_s = ", ".join(
            WaterbodyInflowSeasonal.objects.filter(
                activity_data_record__activity_id=self.id
            ).values_list("flow_code__full", flat=True)
        )
        waterlevel_management = ", ".join(
            WaterbodyLevelManagement.objects.filter(
                activity_data_record__activity_id=self.id
            ).values_list("waterlevel_management__full", flat=True)
        )
        outflow_p = ", ".join(
            WaterbodyOutflowPermanent.objects.filter(
                activity_data_record__activity_id=self.id
            ).values_list("flow_code__full", flat=True)
        )
        outflow_s = ", ".join(
            WaterbodyOutflowSeasonal.objects.filter(
                activity_data_record__activity_id=self.id
            ).values_list("flow_code__full", flat=True)
        )
        waterbody_use = ", ".join(
            WaterbodyUse.objects.filter(
                activity_data_record__activity_id=self.id
            ).values_list("waterbody_use__full", flat=True)
        )
        shorelines = ShorelineTypes.objects.filter(
            activity_data_record__activity_id=self.id
        ).values_list("shoreline_type__full", "percent_covered")
        shoreline_type = ", ".join(
            f"{shore_type} ({percent_covered}%)"
            for shore_type, percent_covered in shorelines
        )
        substrate = ", ".join(
            WaterbodySubstrateType.objects.filter(
                activity_data_record__activity_id=self.id
            ).values_list("substrate_type__full", flat=True)
        )
        has_voucher_specimen = YesNo.Yes.value if voucher_specimen else YesNo.No.value
        rows = []

        for entry in self.entries:
            rows.append(
                self.csv_model(
                    **common_fields,
                    observation_type=entry.observation_type,
                    sample_point_id=entry.sample_point_id,
                    invasive_plant=self.safe_attr(entry, "invasive_plant", "full"),
                    life_stage=self.safe_attr(entry, "life_stage", "full"),
                    density=self.safe_attr(entry, "density", "full"),
                    distribution=self.safe_attr(entry, "distribution", "full"),
                    suitable_for_biocontrol=ctx.suitable_for_biocontrol,
                    shorelines=shoreline_type,
                    waterbody_type=wb_ctx.type,
                    name_gazetted=wb_ctx.name_gazetted,
                    name_local=wb_ctx.name_local,
                    waterbody_access=wb_ctx.access,
                    water_use=waterbody_use,
                    water_level_management=waterlevel_management,
                    outflow_seasonal=outflow_s,
                    outflow_permanent=outflow_p,
                    inflow_seasonal=inflow_s,
                    inflow_permanent=inflow_p,
                    waterbody_comment=wb_ctx.comment,
                    sample_water_depth_m=wb_ctx.max_depth_m,
                    secchi_depth_m=wb_ctx.secchi_depth,
                    water_colour=wb_ctx.colour,
                    tidal_influence=wb_ctx.tidal_influence,
                    has_voucher_specimen=has_voucher_specimen,
                    pretreatment_observation=pto.pre_treatment_observation,
                    substrate_type=substrate,
                    adjacent_land_use=adjacent_land_use,
                )
            )
            self.csv_model.objects.bulk_create(rows)
