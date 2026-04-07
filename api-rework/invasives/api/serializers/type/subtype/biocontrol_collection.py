from rest_framework import serializers

from api.models.activity import (
    TerrestrialBiocontrolCollectionEntry,
    TerrestrialBiocontrolAgentCount,
    WeatherConditions,
    MicrositeCondition,
    TargetPlantPhenology,
    WellEntry,
)
from api.serializers.common import (
    WeatherConditionsSerializer,
    MicrositeConditionSerializer,
    TargetPlantPhenologySerializer,
    TerrestrialBiocontrolAgentCountSerializer,
    NearestWellSerializer,
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


class BiocontrolCollectionSerializer(serializers.Serializer):
    def get_weather_conditions(self, obj):
        children = WeatherConditions.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            WeatherConditionsSerializer(children).data if children is not None else None
        )

    def get_microsite_condition(self, obj):
        children = MicrositeCondition.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            MicrositeConditionSerializer(children).data
            if children is not None
            else None
        )

    def get_target_plant_phenology(self, obj):
        children = TargetPlantPhenology.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            TargetPlantPhenologySerializer(children).data
            if children is not None
            else None
        )

    def get_entries(self, obj):
        children = TerrestrialBiocontrolCollectionEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return TerrestrialBiocontrolCollectionEntrySerializer(children, many=True).data

    weather_conditions = serializers.SerializerMethodField()
    microsite_condition = serializers.SerializerMethodField()
    target_plant_phenology = serializers.SerializerMethodField()
    entries = serializers.SerializerMethodField()
    well_entries = serializers.SerializerMethodField()

    def get_well_entries(self, obj):
        children = WellEntry.objects.filter(activity_data_record__activity_id=obj.id)
        return NearestWellSerializer(children, many=True).data
