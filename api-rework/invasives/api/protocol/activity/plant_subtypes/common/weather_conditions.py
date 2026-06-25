from api.protocol.activity.plant_subtypes.base_form_schema import CleanSchema
from pydantic import Field
from typing import Optional
from api.protocol.activity.validators.code_validation import (
    CloudCoverCodeType,
    PrecipitationCodeType,
    WindDirectionCodeType,
)


class DraftWeatherConditions(CleanSchema):
    comments: Optional[str] = None
    cloud_cover: Optional[CloudCoverCodeType]
    precipitation: Optional[PrecipitationCodeType]
    wind_direction: Optional[WindDirectionCodeType]
    wind_speed_kmh: Optional[int]
    temperature: Optional[int]


class WeatherConditions(DraftWeatherConditions):
    cloud_cover: CloudCoverCodeType
    precipitation: PrecipitationCodeType
    wind_direction: WindDirectionCodeType
    wind_speed_kmh: int = Field(..., ge=0, lt=100)
    temperature: int = Field(..., ge=-18, lt=100)
