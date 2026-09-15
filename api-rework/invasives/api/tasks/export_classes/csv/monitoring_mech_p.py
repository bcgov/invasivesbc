from . import CsvTransformerBase
from api.models.activity import (
    AquaticTreatmentMonitoringEntry,
    TerrestrialTreatmentMonitoringEntry,
    InvasivePlantsOnSite,
)
from itertools import chain
from api.models.export.csv import MonitoringMechanicalPlant


class MonitoringMechanicalTreatmentPlantCsvRow(
    CsvTransformerBase[MonitoringMechanicalPlant, TerrestrialTreatmentMonitoringEntry]
):
    csv_model = MonitoringMechanicalPlant
    entry_model = TerrestrialTreatmentMonitoringEntry

    def build_rows(self, common_fields):
        aquatic_entries = AquaticTreatmentMonitoringEntry.objects.filter(
            activity_data_record__activity_id=self.id
        )
        rows = []
        for entry in chain(self.entries, aquatic_entries):
            plants_on_site = ", ".join(
                InvasivePlantsOnSite.objects.filter(
                    activity_data_record_id=entry.activity_data_record_id
                ).values_list("invasive_plants_on_site__full", flat=True)
            )
            rows.append(
                self.csv_model(
                    **common_fields,
                    invasive_plant=self.safe_attr(entry, "invasive_plant", "full"),
                    treatment_efficacy=self.safe_attr(
                        entry, "treatment_efficacy_rating"
                    ),
                    management_efficacy=self.safe_attr(
                        entry, "management_efficacy_rating"
                    ),
                    treatment_evidence=self.safe_attr(entry, "evidence_of_treatment"),
                    invasive_plants_on_site=plants_on_site,
                    treatment_pass=self.safe_attr(entry, "treatment_pass"),
                    monitoring_comment=self.safe_attr(entry, "comment"),
                )
            )

        self.csv_model.objects.bulk_create(rows)
