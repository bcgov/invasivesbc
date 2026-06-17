from api.serializers.plant_write_serializers import ActivityWriteSerializer
from rest_framework import serializers
from api.models.activity import (
    TerrestrialBiocontrolReleaseEntry,
    TargetPlantHeights,
    TargetPlantPhenology,
    MicrositeCondition,
    WeatherConditions,
    TerrestrialBiocontrolAgentCount,
    Activity,
    ActivityDataRecord,
)
from .common import (
    MicrositeConditionsSerializer,
    TerrestrialBiocontrolAgentCountWriteSerializer,
    TargetPlantPhenologyWriteSerializer,
    WeatherConditionsSerializer,
)


class EntrySerializer(serializers.ModelSerializer):
    actual_biological_agents = TerrestrialBiocontrolAgentCountWriteSerializer(
        many=True, allow_empty=True
    )
    estimated_biological_agents = TerrestrialBiocontrolAgentCountWriteSerializer(
        many=True, allow_empty=True
    )

    class Meta:
        model = TerrestrialBiocontrolReleaseEntry
        fields = (
            "agent_source",
            "biocontrol_agent",
            "collection_date",
            "linear_segment",
            "invasive_plant",
            "mortality",
            "plant_collected_from",
            "plant_collected_from_manual",
            "estimated_biological_agents",
            "actual_biological_agents",
        )


class SubtypeSerializer(serializers.Serializer):
    entries = EntrySerializer(required=True, many=True)
    target_plant_phenology = TargetPlantPhenologyWriteSerializer(
        required=False, allow_null=True
    )
    microsite_conditions = MicrositeConditionsSerializer()
    weather_conditions = WeatherConditionsSerializer()


class BiocontrolReleaseWriteSerializer(ActivityWriteSerializer):
    subtype_data = SubtypeSerializer(write_only=True, required=True)

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
            TerrestrialBiocontrolReleaseEntry.objects.create(
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
