from rest_framework import serializers
from api.models.activity import WeatherConditions

class WeatherConditionsSerializer(serializers.ModelSerializer):
  class Meta:
    model = WeatherConditions
    fields = (
      "comments",
      "cloud_cover",
      "precipitation",
      "temperature",
      "wind_direction",
      "wind_speed_kmh",
    )
