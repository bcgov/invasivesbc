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
        tpp = subtype_data.get("target_plant_phenology")
        if tpp:
            plant_heights = tpp.pop("target_plant_heights")
            TargetPlantPhenology.objects.create(activity_data_record=adr, **tpp)

            TargetPlantHeights.objects.bulk_create(
                TargetPlantHeights(activity_data_record=adr, **tph)
                for tph in plant_heights
            )

        mc = subtype_data.get("microsite_conditions")
        if mc:
            MicrositeCondition.objects.create(activity_data_record=adr, **mc)

        wc = subtype_data.get("weather_conditions")
        if wc:
            WeatherConditions.objects.create(activity_data_record=adr, **wc)

        for entry in subtype_data.get("entries", []):
            aba = entry.pop("actual_biological_agents", [])
            eba = entry.pop("estimated_biological_agents", [])
            adr = ActivityDataRecord.objects.create(activity=parent)
            TerrestrialBiocontrolReleaseEntry.objects.create(
                activity_data_record=adr, **entry
            )
            TerrestrialBiocontrolAgentCount.objects.bulk_create(
                TerrestrialBiocontrolAgentCount(
                    activity_data_record=adr, is_estimate=False, **count
                )
                for count in aba
            )
            TerrestrialBiocontrolAgentCount.objects.bulk_create(
                TerrestrialBiocontrolAgentCount(
                    activity_data_record=adr, is_estimate=True, **count
                )
                for count in eba
            )
