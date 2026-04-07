from rest_framework import serializers
from api.models.activity import (
    TerrestrialBiocontrolReleaseEntry,
    TerrestrialBiocontrolAgentCount,
    WeatherConditions,
    MicrositeCondition,
    TargetPlantPhenology,
    WellEntry,
)
from api.serializers.common import (
    TerrestrialBiocontrolAgentCountSerializer,
    TargetPlantPhenologySerializer,
    MicrositeConditionSerializer,
    WeatherConditionsSerializer,
    NearestWellSerializer,
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
            activity_data_record=obj.activity_data_record,
            is_estimate=False,
        )
        return TerrestrialBiocontrolAgentCountSerializer(qs, many=True).data

    def get_estimated_biological_agents(self, obj):
        qs = TerrestrialBiocontrolAgentCount.objects.filter(
            activity_data_record=obj.activity_data_record,
            is_estimate=True,
        )
        return TerrestrialBiocontrolAgentCountSerializer(qs, many=True).data


class BiocontrolReleaseSerializer(serializers.Serializer):
    def get_target_plant_phenology(self, obj):
        children = TargetPlantPhenology.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            TargetPlantPhenologySerializer(children).data
            if children is not None
            else None
        )

    def get_weather_conditions(self, obj):
        children = WeatherConditions.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            WeatherConditionsSerializer(children).data if children is not None else None
        )

    def get_microsite_conditions(self, obj):
        children = MicrositeCondition.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            MicrositeConditionSerializer(children).data
            if children is not None
            else None
        )

    def get_entries(self, obj):
        children = TerrestrialBiocontrolReleaseEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return TerrestrialBiocontrolReleaseSerializer(children, many=True).data

    def get_well_entries(self, obj):
        children = WellEntry.objects.filter(activity_data_record__activity_id=obj.id)
        return NearestWellSerializer(children, many=True).data

    well_entries = serializers.SerializerMethodField()
    weather_conditions = serializers.SerializerMethodField()
    microsite_conditions = serializers.SerializerMethodField()
    target_plant_phenology = serializers.SerializerMethodField()
    entries = serializers.SerializerMethodField()
