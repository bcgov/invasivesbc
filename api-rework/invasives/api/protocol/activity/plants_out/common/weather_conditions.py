from ninja import Schema
from typing import Optional
from api.models.activity import (
    Activity,
    WeatherConditions,
    DraftWeatherConditions,
)

type Weather = WeatherConditions | DraftWeatherConditions


##########
#   Weather Conditions
####
class WeatherConditionsOut(Schema):
    comments: Optional[str]
    cloud_cover: Optional[str]
    precipitation: Optional[str]
    temperature: Optional[int]
    wind_direction: Optional[str]
    wind_speed_kmh: Optional[int]

    @staticmethod
    def resolve_cloud_cover(obj: Weather):
        return obj.cloud_cover.code if obj.cloud_cover else None

    @staticmethod
    def resolve_precipitation(obj: Weather):
        return obj.precipitation.code if obj.precipitation else None

    @staticmethod
    def resolve_wind_direction(obj: Weather):
        return obj.wind_direction.code if obj.wind_direction else None


class WeatherConditionsOutMixin(Schema):
    weather_conditions: WeatherConditionsOut

    @staticmethod
    def resolve_weather_conditions(obj: Activity):
        return WeatherConditions.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()


class DraftWeatherConditionsOutMixin(WeatherConditionsOutMixin):
    @staticmethod
    def resolve_weather_conditions(obj: Activity):
        return DraftWeatherConditions.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
