from rest_framework import serializers
from api.models.activity import (
    TerrestrialBiocontrolReleaseEntry,
    TerrestrialBiocontrolAgentCount,
)
from api.serializers.common import (
    TerrestrialBiocontrolAgentCountSerializer,
    TargetPlantPhenologySerializer,
    MicrositeConditionSerializer,
    WeatherConditionsSerializer,
)


class TerrestrialBiocontrolReleaseSerializer(serializers.ModelSerializer):
    actual_biological_agents = serializers.SerializerMethodField()
    estimated_biological_agents = serializers.SerializerMethodField()

    class Meta:
        model = TerrestrialBiocontrolReleaseEntry
        fields = (
            "actual_biological_agents",
            "agent_source",
            "biocontrol_agent",
            "collection_date",
            "estimated_biological_agents",
            "linear_segment",
            "invasive_plant",
            "mortality",
            "plant_collected_from",
            "plant_collected_from_manual",
        )

    def get_actual_biological_agents(self, obj):
        qs = TerrestrialBiocontrolAgentCount.objects.filter(
            activity=obj.activity,
            is_estimate=False,
            invasive_plant=obj.invasive_plant,
            biocontrol_agent=obj.biocontrol_agent,
        )
        return TerrestrialBiocontrolAgentCountSerializer(qs, many=True).data

    def get_estimated_biological_agents(self, obj):
        qs = TerrestrialBiocontrolAgentCount.objects.filter(
            activity=obj.activity,
            is_estimate=True,
            invasive_plant=obj.invasive_plant,
            biocontrol_agent=obj.biocontrol_agent,
        )
        return TerrestrialBiocontrolAgentCountSerializer(qs, many=True).data


class BiocontrolReleaseSerializer(serializers.Serializer):
    entries = TerrestrialBiocontrolReleaseSerializer(
        source="terrestrialbiocontrolrelease_set", many=True
    )
    target_plant_phenology = TargetPlantPhenologySerializer(
        source="targetplantphenology"
    )
    microsite_condition = MicrositeConditionSerializer(source="micrositecondition")
    weather_conditions = WeatherConditionsSerializer(source="weatherconditions")

    def to_representation(self, instance):
        keys = ["microsite_condition", "weather_conditions"]
        ret = super().to_representation(instance)

        for key in keys:
            info_data = ret.pop(key, None)
            if info_data and isinstance(info_data, dict):
                ret.update(info_data)
        return ret
