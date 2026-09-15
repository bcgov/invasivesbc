from . import CsvTransformerBase
from api.models.activity import (
    TerrestrialPlantMechanicalTreatmentEntry,
)
from api.models.export.csv import TreatmentMechanicalPlantTerrestrial


class TreatmentMechanicalPlantTerrestrialCsvRow(
    CsvTransformerBase[
        TreatmentMechanicalPlantTerrestrial, TerrestrialPlantMechanicalTreatmentEntry
    ]
):
    csv_model = TreatmentMechanicalPlantTerrestrial
    entry_model = TerrestrialPlantMechanicalTreatmentEntry

    def build_rows(self, common_fields):
        rows = []
        for entry in self.entries:
            rows.append(
                self.csv_model(
                    **common_fields,
                    invasive_plant=self.safe_attr(entry, "invasive_plant", "full"),
                    treated_area_sqm=self.safe_attr(entry, "treated_area_msq"),
                    mechanical_method=self.safe_attr(entry, "mechanical_method"),
                    disposal_method=self.safe_attr(entry, "disposal_method"),
                    disposed_material_format=self.safe_attr(
                        entry, "disposed_material_format"
                    ),
                    disposed_material_amount=self.safe_attr(
                        entry, "disposed_material_amount"
                    ),
                )
            )
        self.csv_model.objects.bulk_create(rows)
