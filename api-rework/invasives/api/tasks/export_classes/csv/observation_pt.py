from . import CsvTransformerBase
from api.models.export.csv import ObservationPlantTerrestrial
from api.models.activity import (
    TerrestrialPlantObservationEntries,
    TerrestrialPlantObservationContext,
    TerrestrialVoucherSpecimen,
    PretreatmentObservation,
    SpecificUse,
)
from api.models.enums import YesNo


class ObservationPlantTerrestrialCsvRow(
    CsvTransformerBase[ObservationPlantTerrestrial, TerrestrialPlantObservationEntries]
):
    csv_model = ObservationPlantTerrestrial
    entry_model = TerrestrialPlantObservationEntries

    def build_rows(self, common_fields):
        ctx = TerrestrialPlantObservationContext.objects.filter(
            activity_data_record__activity_id=self.id
        ).first()

        pto = PretreatmentObservation.objects.filter(
            activity_data_record__activity_id=self.id
        ).first()

        specific_uses = (
            ", ".join(
                SpecificUse.objects.filter(
                    activity_data_record__activity_id=self.id
                ).values_list("specific_use__full", flat=True)
            )
            or None
        )

        rows = []
        for entry in self.entries:
            voucher_specimen = TerrestrialVoucherSpecimen.objects.filter(
                activity_data_record_id=entry.activity_data_record_id
            ).exists()
            has_voucher_specimen = (
                YesNo.Yes.value if voucher_specimen else YesNo.No.value
            )

            rows.append(
                self.csv_model(
                    **common_fields,
                    # Entry
                    density=self.safe_attr(entry, "density", "full"),
                    distribution=self.safe_attr(entry, "distribution", "full"),
                    invasive_plant=self.safe_attr(entry, "invasive_plant", "full"),
                    life_stage=self.safe_attr(entry, "life_stage", "full"),
                    observation_type=entry.observation_type,
                    has_voucher_specimen=has_voucher_specimen,
                    # Context
                    aspect=self.safe_attr(ctx, "aspect", "full"),
                    pretreatment_observation=pto.pre_treatment_observation,
                    research_observation=ctx.research_observation,
                    slope_percent=self.safe_attr(ctx, "slope_percent", "full"),
                    soil_texture=self.safe_attr(ctx, "soil_texture", "full"),
                    specific_use=specific_uses,
                    suitable_for_biocontrol_agent=ctx.suitable_for_biocontrol_agent,
                    visible_well_nearby=ctx.visible_well_nearby,
                )
            )
        self.csv_model.objects.bulk_create(rows)
