from rest_framework import serializers
from api.models.activity import (
    TerrestrialBiocontrolReleaseEntry,
    TerrestrialBiocontrolAgentCount,
    WeatherConditions,
    MicrositeCondition,
    TargetPlantPhenology,
    DraftTerrestrialBiocontrolReleaseEntry,
    DraftTerrestrialBiocontrolAgentCount,
    DraftWeatherConditions,
    DraftMicrositeCondition,
    DraftTargetPlantPhenology,
)
from api.serializers.common import (
    TerrestrialBiocontrolAgentCountSerializer,
    TargetPlantPhenologySerializer,
    MicrositeConditionSerializer,
    WeatherConditionsSerializer,
    DraftTerrestrialBiocontrolAgentCountSerializer,
    DraftTargetPlantPhenologySerializer,
    DraftMicrositeConditionSerializer,
    DraftWeatherConditionsSerializer,
)


############
# Serializers for Entries
############
class BaseEntrySerializer(serializers.ModelSerializer):
    actual_biological_agents = serializers.SerializerMethodField()
    estimated_biological_agents = serializers.SerializerMethodField()
    collection_date = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")

    class Meta:
        abstract = True
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


class TerrestrialBiocontrolEntryReleaseSerializer(BaseEntrySerializer):
    class Meta(BaseEntrySerializer.Meta):
        model = TerrestrialBiocontrolReleaseEntry

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


class DraftTerrestrialBiocontrolEntryReleaseSerializer(BaseEntrySerializer):
    class Meta(BaseEntrySerializer.Meta):
        model = TerrestrialBiocontrolReleaseEntry

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


class BiocontrolReleaseSerializer(BaseSerializer):
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
        return TerrestrialBiocontrolEntryReleaseSerializer(children, many=True).data


class DraftBiocontrolReleaseSerializer(BaseSerializer):
    def get_target_plant_phenology(self, obj):
        children = DraftTargetPlantPhenology.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            DraftTargetPlantPhenologySerializer(children).data
            if children is not None
            else None
        )

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

    def get_entries(self, obj):
        children = DraftTerrestrialBiocontrolReleaseEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftTerrestrialBiocontrolEntryReleaseSerializer(
            children, many=True
        ).data
