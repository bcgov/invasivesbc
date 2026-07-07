from rest_framework import serializers

from api.models.activity import (
    TerrestrialBiocontrolCollectionEntry,
    TerrestrialBiocontrolAgentCount,
    WeatherConditions,
    MicrositeCondition,
    TargetPlantPhenology,
    DraftTerrestrialBiocontrolCollectionEntry,
    DraftTerrestrialBiocontrolAgentCount,
    DraftWeatherConditions,
    DraftMicrositeCondition,
    DraftTargetPlantPhenology,
)
from api.serializers.common import (
    WeatherConditionsSerializer,
    MicrositeConditionSerializer,
    TargetPlantPhenologySerializer,
    TerrestrialBiocontrolAgentCountSerializer,
    DraftWeatherConditionsSerializer,
    DraftMicrositeConditionSerializer,
    DraftTargetPlantPhenologySerializer,
    DraftTerrestrialBiocontrolAgentCountSerializer,
)


############
# Serializers for Entries
############
class BaseEntrySerializer(serializers.ModelSerializer):
    actual_biological_agents = serializers.SerializerMethodField()
    estimated_biological_agents = serializers.SerializerMethodField()
    start_time_collecting = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")
    end_time_collecting = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")

    class Meta:
        abstract = True
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


class TerrestrialBiocontrolCollectionEntrySerializer(BaseEntrySerializer):

    class Meta(BaseEntrySerializer.Meta):
        model = TerrestrialBiocontrolCollectionEntry

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


class DraftTerrestrialBiocontrolCollectionEntrySerializer(BaseEntrySerializer):

    class Meta(BaseEntrySerializer.Meta):
        model = DraftTerrestrialBiocontrolCollectionEntry

    def get_actual_biological_agents(self, obj):
        qs = DraftTerrestrialBiocontrolAgentCount.objects.filter(
            activity_data_record=obj.activity_data_record,
            is_estimate=False,
        )
        return DraftTerrestrialBiocontrolAgentCountSerializer(qs, many=True).data

    def get_estimated_biological_agents(self, obj):
        qs = DraftTerrestrialBiocontrolAgentCount.objects.filter(
            activity_data_record=obj.activity_data_record,
            is_estimate=True,
        )
        return DraftTerrestrialBiocontrolAgentCountSerializer(qs, many=True).data


############
# Serializers for Subtype Data
############
class BaseSerializer(serializers.Serializer):
    weather_conditions = serializers.SerializerMethodField()
    microsite_conditions = serializers.SerializerMethodField()
    target_plant_phenology = serializers.SerializerMethodField()
    entries = serializers.SerializerMethodField()

    class Meta:
        abstract = True


class BiocontrolCollectionSerializer(BaseSerializer):
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


class DraftBiocontrolCollectionSerializer(BaseSerializer):
    def get_weather_conditions(self, obj):
        children = DraftWeatherConditions.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            DraftWeatherConditionsSerializer(children).data
            if children is not None
            else None
        )

    def get_microsite_conditions(self, obj):
        children = DraftMicrositeCondition.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            DraftMicrositeConditionSerializer(children).data
            if children is not None
            else None
        )

    def get_target_plant_phenology(self, obj):
        children = DraftTargetPlantPhenology.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            DraftTargetPlantPhenologySerializer(children).data
            if children is not None
            else None
        )

    def get_entries(self, obj):
        children = DraftTerrestrialBiocontrolCollectionEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftTerrestrialBiocontrolCollectionEntrySerializer(
            children, many=True
        ).data
