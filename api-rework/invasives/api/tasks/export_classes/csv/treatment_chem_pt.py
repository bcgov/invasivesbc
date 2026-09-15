from . import CsvTransformerBase
from api.models.activity import (
    ChemicalTreatmentContext,
    ChemicalApplicationCalculationEntry,
    ChemTreatmentContext,
    WellEntry,
)
from api.models.enums import YesNo
from api.models.export.csv import TreatmentChemicalPlantTerrestrial


class TreatmentChemicalPlantTerrestrialCsvRow(
    CsvTransformerBase[
        TreatmentChemicalPlantTerrestrial, ChemicalApplicationCalculationEntry
    ]
):
    csv_model = TreatmentChemicalPlantTerrestrial
    entry_model = ChemicalApplicationCalculationEntry

    def build_rows(self, common_fields):
        self.logger.info(f"{len(self.entries)}, {__name__}")
        ctx = ChemicalTreatmentContext.objects.get(
            activity_data_record__activity_id=self.id
        )
        chem_ctx = ChemTreatmentContext.objects.get(
            activity_data_record__activity_id=self.id
        )
        nearest_well = (
            WellEntry.objects.filter(activity_data_record__activity_id=self.id)
            .order_by("distance")
            .values_list("distance", flat=True)
            .first()
        )

        has_tank_mix = YesNo.Yes.value if chem_ctx.tank_mix else YesNo.No.value

        # Chem Treatments are special case where rows are based per jursidiction
        common_fields.pop("jurisdictions")

        rows = []

        for entry in self.entries:
            jurisdictions = f"{self.safe_attr(entry, "jurisdiction", "full")} ({self.safe_attr(entry, "jurisdiction_percent")}%)"
            rows.append(
                self.csv_model(
                    **common_fields,
                    jurisdictions=jurisdictions,
                    well_proximity_m=nearest_well,
                    service_license=self.safe_attr(
                        ctx, "pesticide_employer_code", "full"
                    ),
                    pest_management_plan=self.safe_attr(
                        ctx, "pest_management_plan", "full"
                    ),
                    pmp_not_in_dropdown=self.safe_attr(
                        ctx, "pest_management_plan_manual"
                    ),
                    temperature_c=self.safe_attr(ctx, "temperature_c"),
                    wind_speed_kmh=self.safe_attr(ctx, "wind_speed_kmh"),
                    wind_direction=self.safe_attr(ctx, "wind_direction", "full"),
                    humidity=self.safe_attr(ctx, "humidity"),
                    treatment_notice_signs=self.safe_attr(
                        ctx, "treatment_notice_signs"
                    ),
                    application_start_time=self.safe_attr(
                        ctx, "application_start_time"
                    ),
                    pest_injury_threshold=self.safe_attr(
                        ctx, "pest_injury_threshold_determination"
                    ),
                    invasive_plant=self.safe_attr(entry, "invasive_plant", "full"),
                    invasive_plant_percent_covered=self.safe_attr(
                        entry, "invasive_plant_percent"
                    ),
                    tank_mix_used=has_tank_mix,
                    chemical_application_method=self.safe_attr(
                        chem_ctx, "application_method", "full"
                    ),
                    herbicide_type=self.safe_attr(entry, "herbicide_type", "full"),
                    herbicide_name=self.safe_attr(entry, "herbicide_name", "full"),
                    calculation_type=self.safe_attr(chem_ctx, "calculation_type"),
                    delivery_rate_of_mix=self.safe_attr(chem_ctx, "delivery_rate"),
                    product_application_rate=self.safe_attr(
                        entry, "product_application_rate"
                    ),
                    dilution_percent=self.safe_attr(chem_ctx, "dilution_percent"),
                    undiluted_herbicide_used_l=self.safe_attr(
                        entry, "undiluted_herbicide_used_l"
                    ),
                    area_treated_sqm=self.safe_attr(entry, "area_treated_sqm"),
                    amount_of_mix_used=self.safe_attr(entry, "amount_of_mix_used"),
                    percent_area_covered=self.safe_attr(
                        entry, "percentage_area_covered"
                    ),
                )
            )
        self.csv_model.objects.bulk_create(rows)
