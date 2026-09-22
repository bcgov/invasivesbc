from . import CsvTransformerBase
from api.models.activity import TerrestrialBiocontrolReleaseEntry, MicrositeCondition
from api.models.export.csv import TreatmentBiocontrolReleasePlant


class TreatmentBiocontrolReleasePlantCsvRow(
    CsvTransformerBase[
        TreatmentBiocontrolReleasePlant, TerrestrialBiocontrolReleaseEntry
    ]
):
    csv_model = TreatmentBiocontrolReleasePlant
    entry_model = TerrestrialBiocontrolReleaseEntry

    def build_rows(self, common_fields):
        microsite_conditions = MicrositeCondition.objects.filter(
            activity_data_record__activity_id=self.id
        ).first()

        rows = []
        for entry in self.entries:
            rows.append(
                self.csv_model(
                    **common_fields,
                    # Microsite
                    mesoslope_position=self.safe_attr(
                        microsite_conditions, "mesoslope_position", "full"
                    ),
                    site_surface_shape=self.safe_attr(
                        microsite_conditions, "site_surface_shape", "full"
                    ),
                    # Entry
                    invasive_plant=self.safe_attr(entry, "invasive_plant", "full"),
                    biological_agent=self.safe_attr(entry, "biocontrol_agent", "full"),
                    linear_segment=self.safe_attr(entry, "linear_segment"),
                    agent_mortality=self.safe_attr(entry, "mortality"),
                    agent_source=self.safe_attr(entry, "agent_source"),
                    collection_date=self.safe_attr(entry, "collection_date"),
                    plant_collected_from=self.safe_attr(
                        entry, "plant_collected_from", "full"
                    ),
                    plant_collected_from_unlisted=self.safe_attr(
                        entry, "plant_collected_from_manual"
                    ),
                )
            )
        self.csv_model.objects.bulk_create(rows)
