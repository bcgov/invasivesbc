from . import CsvTransformerBase
from api.models.activity import (
    TerrestrialBiocontrolCollectionEntry,
    MicrositeCondition,
    WeatherConditions,
    TerrestrialBiocontrolAgentCount,
    TargetPlantPhenology,
    TargetPlantHeights,
)
from api.models.export.csv import BiocontrolCollectionPlant
from api.models.enums import YesNo
from django.db.models import Sum


class BiocontrolCollectionPlantCsvRow(
    CsvTransformerBase[BiocontrolCollectionPlant, TerrestrialBiocontrolCollectionEntry]
):
    csv_model = BiocontrolCollectionPlant
    entry_model = TerrestrialBiocontrolCollectionEntry

    def build_rows(self, common_fields):
        weather = WeatherConditions.objects.filter(
            activity_data_record__activity_id=self.id
        ).first()
        phenology = TargetPlantPhenology.objects.filter(
            activity_data_record__activity_id=self.id
        ).first()
        target_plant_heights = (
            ", ".join(
                map(  # Convert ints to strings
                    str,
                    TargetPlantHeights.objects.filter(
                        activity_data_record__activity_id=self.id
                    )
                    .order_by("height_cm")
                    .values_list("height_cm", flat=True),
                )
            )
            or None
        )
        microsite = MicrositeCondition.objects.filter(
            activity_data_record__activity_id=self.id
        ).first()
        has_phenology = YesNo.Yes.value if phenology else YesNo.No.value

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
                    temperature_c=self.safe_attr(weather, "temperature"),
                    cloud_cover=self.safe_attr(weather, "cloud_cover", "full"),
                    precipitation=self.safe_attr(weather, "precipitation", "full"),
                    wind_speed_kmh=self.safe_attr(weather, "wind_speed_kmh"),
                    wind_direction=self.safe_attr(weather, "wind_direction", "full"),
                    weather_comments=self.safe_attr(weather, "comments"),
                    mesoslope_position=self.safe_attr(
                        microsite, "mesoslope_position", "full"
                    ),
                    site_surface_shape=self.safe_attr(
                        microsite, "site_surface_shape", "full"
                    ),
                    invasive_plant=self.safe_attr(entry, "invasive_plant", "full"),
                    biological_agent=self.safe_attr(entry, "biological_agent", "full"),
                    historical_iapp_site=self.safe_attr(entry, "historical_iapp_site"),
                    collection_type=self.safe_attr(entry, "collection_type"),
                    plant_count_collection=self.safe_attr(
                        entry, "plant_count_collection"
                    ),
                    time_collection_duration_minutes=self.safe_attr(
                        entry, "time_collection_duration_minutes"
                    ),
                    collection_method=self.safe_attr(
                        entry, "collection_method", "full"
                    ),
                    number_of_sweeps=self.safe_attr(entry, "number_of_sweeps"),
                    start_time_collecting=self.safe_attr(
                        entry, "start_time_collecting"
                    ),
                    end_time_collecting=self.safe_attr(entry, "end_time_collecting"),
                    comment=self.safe_attr(entry, "comment"),
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
                    phenology_details_recorded=has_phenology,
                    target_plant_heights=target_plant_heights,
                    winter_dormant=self.safe_attr(phenology, "winter_dormant"),
                    seedlings=self.safe_attr(phenology, "seedlings"),
                    rosettes=self.safe_attr(phenology, "rosettes"),
                    bolts=self.safe_attr(phenology, "bolts"),
                    flowering=self.safe_attr(phenology, "flowering"),
                    seeds_forming=self.safe_attr(phenology, "seeds_forming"),
                    senescent=self.safe_attr(phenology, "senescent"),
                )
            )
        self.csv_model.objects.bulk_create(rows)
