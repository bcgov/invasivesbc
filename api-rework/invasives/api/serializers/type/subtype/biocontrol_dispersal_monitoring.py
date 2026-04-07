from rest_framework import serializers

from api.models.activity import (
    WeatherConditions,
    MicrositeCondition,
    TargetPlantPhenology,
    TerrestrialBiocontrolDispersalMonitoringEntry,
)
from api.serializers.common import (
    MicrositeConditionSerializer,
    TerrestrialBiologicalMonitoringEntriesSerializer,
    TargetPlantPhenologySerializer,
    WeatherConditionsSerializer,
)


class BiocontrolDispersalMonitoringSerializer(serializers.Serializer):
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
        children = TerrestrialBiocontrolDispersalMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return TerrestrialBiologicalMonitoringEntriesSerializer(
            children, many=True
        ).data

    weather_conditions = serializers.SerializerMethodField()
    microsite_conditions = serializers.SerializerMethodField()
    target_plant_phenology = serializers.SerializerMethodField()
    entries = serializers.SerializerMethodField()
