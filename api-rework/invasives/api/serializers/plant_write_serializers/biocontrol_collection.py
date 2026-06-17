from api.serializers.plant_write_serializers import ActivityWriteSerializer
from rest_framework import serializers
from api.models.activity import (
    TargetPlantHeights,
    TargetPlantPhenology,
    MicrositeCondition,
    WeatherConditions,
    TerrestrialBiocontrolAgentCount,
    Activity,
    ActivityDataRecord,
    TerrestrialBiocontrolCollectionEntry,
)
from .common import (
    MicrositeConditionsSerializer,
    TerrestrialBiocontrolAgentCountWriteSerializer,
    TargetPlantPhenologyWriteSerializer,
    WeatherConditionsSerializer,
)
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    TargetPlantHeights,
    TargetPlantPhenology,
    MicrositeCondition,
    WeatherConditions,
    TerrestrialBiocontrolAgentCount,
)


class EntrySerializer(serializers.ModelSerializer):
    actual_biological_agents = TerrestrialBiocontrolAgentCountWriteSerializer(
        many=True, allow_empty=True
    )
    estimated_biological_agents = TerrestrialBiocontrolAgentCountWriteSerializer(
        many=True, allow_empty=True
    )

    class Meta:
        model = TerrestrialBiocontrolCollectionEntry
        fields = (
            "invasive_plant",
            "biological_agent",
            "collection_type",
            "collection_method",
            "start_time_collecting",
            "end_time_collecting",
            "comment",
            "actual_biological_agents",
            "number_of_sweeps",
            "plant_count_collection",
            "estimated_biological_agents",
            "historical_iapp_site",
            "time_collection_duration_minutes",
        )


class SubtypeSerializer(serializers.Serializer):
    entries = EntrySerializer(required=True, many=True)
    microsite_conditions = MicrositeConditionsSerializer(required=True)
    target_plant_phenology = TargetPlantPhenologyWriteSerializer(
        required=False, allow_null=True
    )
    weather_conditions = WeatherConditionsSerializer(required=True)


class BiocontrolCollectionWriteSerializer(ActivityWriteSerializer):
    subtype_data = SubtypeSerializer(required=True)

    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)
        phenology = subtype_data.get("target_plant_phenology")
        if phenology:
            plant_heights = phenology.pop("target_plant_heights")
            TargetPlantPhenology.objects.create(activity_data_record=adr, **phenology)

            TargetPlantHeights.objects.bulk_create(
                TargetPlantHeights(activity_data_record=adr, **tph)
                for tph in plant_heights
            )

        microsite = subtype_data.get("microsite_conditions")
        if microsite:
            MicrositeCondition.objects.create(activity_data_record=adr, **microsite)

        weather_conditions = subtype_data.get("weather_conditions")
        if weather_conditions:
            WeatherConditions.objects.create(
                activity_data_record=adr, **weather_conditions
            )

        for entry in subtype_data.get("entries", []):
            actual_agents = entry.pop("actual_biological_agents", [])
            estimated_agents = entry.pop("estimated_biological_agents", [])
            adr = ActivityDataRecord.objects.create(activity=parent)
            TerrestrialBiocontrolCollectionEntry.objects.create(
                activity_data_record=adr, **entry
            )
            TerrestrialBiocontrolAgentCount.objects.bulk_create(
                TerrestrialBiocontrolAgentCount(
                    activity_data_record=adr, is_estimate=False, **count
                )
                for count in actual_agents
            )
            TerrestrialBiocontrolAgentCount.objects.bulk_create(
                TerrestrialBiocontrolAgentCount(
                    activity_data_record=adr, is_estimate=True, **count
                )
                for count in estimated_agents
            )
