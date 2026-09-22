from . import CsvTransformerBase
from api.models.activity import (
    AquaticPlantMechanicalTreatmentEntry,
    AquaticMechanicalAuthorization,
    ShorelineTypes,
)
from api.models.export.csv import TreatmentMechanicalPlantAquatic


class TreatmentMechanicalPlantAquaticCsvRow(
    CsvTransformerBase[
        TreatmentMechanicalPlantAquatic, AquaticPlantMechanicalTreatmentEntry
    ]
):
    csv_model = TreatmentMechanicalPlantAquatic
    entry_model = AquaticPlantMechanicalTreatmentEntry

    def build_rows(self, common_fields):
        authorization = (
            AquaticMechanicalAuthorization.objects.filter(
                activity_data_record__activity_id=self.id
            )
            .values_list("authorization_information", flat=True)
            .first()
        )
        shorelines = ShorelineTypes.objects.filter(
            activity_data_record__activity_id=self.id
        ).values_list("shoreline_type__full", "percent_covered")

        shoreline_type = (
            ", ".join(
                f"{shore_type} ({percent_covered}%)"
                for shore_type, percent_covered in shorelines
            )
            or None
        )

        rows = []
        for entry in self.entries:
            rows.append(
                self.csv_model(
                    **common_fields,
                    # Entry
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
                    # Shorelines
                    shorelines=shoreline_type,
                    # Mechanical Authorization
                    authorization_information=authorization,
                )
            )
        self.csv_model.objects.bulk_create(rows)
