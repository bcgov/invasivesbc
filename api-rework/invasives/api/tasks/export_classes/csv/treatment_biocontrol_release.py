from . import CsvTransformerBase
from api.models.activity import (
    TerrestrialBiocontrolReleaseEntry,
    MicrositeCondition,
    WeatherConditions,
    TerrestrialBiocontrolAgentCount,
)
from django.db.models import Sum
from api.models.export.csv import TreatmentBiocontrolReleasePlant


class TreatmentBiocontrolReleasePlantCsvRow(
    CsvTransformerBase[
        TreatmentBiocontrolReleasePlant, TerrestrialBiocontrolReleaseEntry
    ]
):
    csv_model = TreatmentBiocontrolReleasePlant
    entry_model = TerrestrialBiocontrolReleaseEntry

    def build_rows(self, common_fields):
        weather = WeatherConditions.objects.filter(
            activity_data_record__activity_id=self.id
        ).first()
        microsite_conditions = MicrositeCondition.objects.filter(
            activity_data_record__activity_id=self.id
        ).first()

        rows = []
        for entry in self.entries:
            est_agents = TerrestrialBiocontrolAgentCount.objects.filter(
                activity_data_record_id=entry.activity_data_record_id, is_estimate=True
            )

            act_agents = TerrestrialBiocontrolAgentCount.objects.filter(
                activity_data_record_id=entry.activity_data_record_id, is_estimate=False
            )
            rows.append(
                self.csv_model(
                    **common_fields,
                    # Weather
                    temperature_c=self.safe_attr(weather, "temperature"),
                    cloud_cover=self.safe_attr(weather, "cloud_cover", "full"),
                    precipitation=self.safe_attr(weather, "precipitation", "full"),
                    wind_speed_kmh=self.safe_attr(weather, "wind_speed_kmh"),
                    wind_direction=self.safe_attr(weather, "wind_direction", "full"),
                    weather_comments=self.safe_attr(weather, "comments"),
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
                    # Entry - Counts
                    actual_biological_agent_stage=", ".join(
                        act_agents.values_list("stage__full", flat=True)
                    )
                    or None,
                    actual_agent_count=", ".join(
                        map(str, act_agents.values_list("quantity", flat=True))
                    )
                    or None,
                    estimated_biological_agent_stage=", ".join(
                        est_agents.values_list("stage__full", flat=True)
                    )
                    or None,
                    estimated_agent_count=", ".join(
                        map(str, est_agents.values_list("quantity", flat=True))
                    )
                    or None,
                    actual_total_agent_quantity=act_agents.aggregate(
                        total=Sum("quantity")
                    )["total"]
                    or 0,
                    estimated_total_agent_quantity=est_agents.aggregate(
                        total=Sum("quantity")
                    )["total"]
                    or 0,
                )
            )
        self.csv_model.objects.bulk_create(rows)
