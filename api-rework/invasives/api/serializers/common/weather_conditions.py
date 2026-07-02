from rest_framework import serializers
from api.models.activity import WeatherConditions, DraftWeatherConditions


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = (
            "comments",
            "cloud_cover",
            "precipitation",
            "temperature",
            "wind_direction",
            "wind_speed_kmh",
        )


class WeatherConditionsSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = WeatherConditions


class DraftWeatherConditionsSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftWeatherConditions
