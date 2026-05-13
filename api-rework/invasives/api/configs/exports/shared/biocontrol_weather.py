from django.db.models import (
    CharField,
)
from django.db.models.functions import Cast
from ..helpers import agg

ROOT = f"root_activity__activitydatarecord"
WEATHER = f"{ROOT}__weatherconditions"
MS = f"{ROOT}__micrositecondition"

BIOCONTROL_WEATHER_ANNOTATIONS = [
    {
        "header": "Temperature (C)",
        "key": "temperature_display",
        "annotation": agg(Cast(f"{WEATHER}__temperature", CharField())),
    },
    {
        "header": "Cloud Cover",
        "key": "cloud_cover_display",
        "annotation": agg(f"{WEATHER}__cloud_cover__full"),
    },
    {
        "header": "Precipitation",
        "key": "precipitation_display",
        "annotation": agg(Cast(f"{WEATHER}__precipitation__full", CharField())),
    },
    {
        "header": "Wind Speed (Km)",
        "key": "wind_speed_display",
        "annotation": agg(Cast(f"{WEATHER}__wind_speed_kmh", CharField())),
    },
    {
        "header": "Wind Direction",
        "key": "wind_direction_display",
        "annotation": agg(f"{WEATHER}__wind_direction__full"),
    },
    {
        "header": "Weather Comments",
        "key": "weather_comments_display",
        "annotation": agg(f"{WEATHER}__comments"),
    },
]
