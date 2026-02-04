from rest_framework import serializers
from api.serializers.common import (
    MicrositeConditionSerializer,
    TerrestrialBiologicalMonitoringEntriesSerializer,
    TargetPlantPhenologySerializer,
    SpreadResultsSerializer,
    WeatherConditionsSerializer,
)


class BiocontrolReleaseMonitoringSerializer(serializers.Serializer):
    microsite_condition = MicrositeConditionSerializer(source="micrositecondition")
    entries = TerrestrialBiologicalMonitoringEntriesSerializer(
        source="terrestrialbiocontroldispersalmonitoringentry_set", many=True
    )
    target_plant_phenology = TargetPlantPhenologySerializer(
        source="targetplantphenology"
    )
    spread_results = SpreadResultsSerializer(source="spreadresults")
    weather_conditions = WeatherConditionsSerializer(source="weatherconditions")

    def to_representation(self, instance):
        keys = ["microsite_condition", "spread_results", "weather_conditions"]
        ret = super().to_representation(instance)

        for key in keys:
            info_data = ret.pop(key, None)
            if info_data and isinstance(info_data, dict):
                ret.update(info_data)
        return ret
