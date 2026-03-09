from rest_framework import serializers
from api.serializers.common import (
    WeatherConditionsSerializer,
    MicrositeConditionSerializer,
    TargetPlantPhenologySerializer,
    TerrestrialBiocontrolAgentCountSerializer,
)
from api.models.activity import (
    TerrestrialBiocontrolCollectionEntry,
    TerrestrialBiocontrolAgentCount,
)


class TerrestrialBiocontrolCollectionEntrySerializer(serializers.ModelSerializer):
    actual_biological_agents = serializers.SerializerMethodField()
    estimated_biological_agents = serializers.SerializerMethodField()
    start_time_collecting = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")
    end_time_collecting = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")

    class Meta:
        model = TerrestrialBiocontrolCollectionEntry
        fields = (
            "actual_biological_agents",
            "estimated_biological_agents",
            "invasive_plant",
            "biological_agent",
            "historical_iapp_site",
            "collection_type",
            "plant_count_collection",
            "time_collection_duration_minutes",
            "collection_method",
            "number_of_sweeps",
            "start_time_collecting",
            "end_time_collecting",
            "comment",
        )

    def get_actual_biological_agents(self, obj):
        qs = TerrestrialBiocontrolAgentCount.objects.filter(
            activity=obj.activity,
            is_estimate=False,
            invasive_plant=obj.invasive_plant,
            biocontrol_agent=obj.biological_agent,
        )
        return TerrestrialBiocontrolAgentCountSerializer(qs, many=True).data

    def get_estimated_biological_agents(self, obj):
        qs = TerrestrialBiocontrolAgentCount.objects.filter(
            activity=obj.activity,
            is_estimate=True,
            invasive_plant=obj.invasive_plant,
            biocontrol_agent=obj.biological_agent,
        )
        return TerrestrialBiocontrolAgentCountSerializer(qs, many=True).data


class BiocontrolCollectionSerializer(serializers.Serializer):
    weather_conditions = WeatherConditionsSerializer(source="weatherconditions")
    microsite_condition = MicrositeConditionSerializer(source="micrositecondition")
    target_plant_phenology = TargetPlantPhenologySerializer(
        source="targetplantphenology"
    )
    entries = TerrestrialBiocontrolCollectionEntrySerializer(
        source="terrestrialbiocontrolcollectionentry_set", many=True
    )

    def to_representation(self, instance):
        keys = ["microsite_condition", "weather_conditions"]
        ret = super().to_representation(instance)

        for key in keys:
            info_data = ret.pop(key, None)
            if info_data and isinstance(info_data, dict):
                ret.update(info_data)
        return ret
