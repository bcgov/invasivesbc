from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import (
    Activity,
    WeatherConditions,
    MicrositeCondition,
    ActivityDataRecord,
)
from api.models.codes import (
    PrecipitationCode,
    WindDirectionCode,
    CloudCoverCode,
    MesoslopePositionCode,
    SiteSurfaceShapeCode,
)


def add_microsite_conditions(
    new: Activity,
    old: LegacyActivity,
):
    ms = old.activity_payload.form_data.activity_subtype_data.Microsite_Conditions
    if ms is None:
        if new.migration_remarks is None:
            new.migration_remarks = ""
        new.migration_remarks += "Microsite conditions on legacy activity is null\n\n"
        return

    adr = ActivityDataRecord.objects.create(activity=new)
    MicrositeCondition.objects.create(
        activity_data_record=adr,
        mesoslope_position=(
            MesoslopePositionCode.objects.get(code=ms.mesoslope_position_code)
            if ms.mesoslope_position_code is not None
            else None
        ),
        site_surface_shape=(
            SiteSurfaceShapeCode.objects.get(code=ms.site_surface_shape_code)
            if ms.site_surface_shape_code is not None
            else None
        ),
    )


def add_weather_conditions(
    new: Activity,
    old: LegacyActivity,
):
    weather = old.activity_payload.form_data.activity_subtype_data.Weather_Conditions

    if weather is None:
        if new.migration_remarks is None:
            new.migration_remarks = ""
        new.migration_remarks += "Weather Conditions on legacy activity is null\n\n"
        return

    if weather.wind_speed == 0 and weather.wind_direction_code is None:
        wd_code = WindDirectionCode.objects.get(code="No Wind")
    else:
        wd_code = (
            WindDirectionCode.objects.get(code=weather.wind_direction_code)
            if weather.wind_direction_code is not None
            else None
        )

    adr = ActivityDataRecord.objects.create(activity=new)
    WeatherConditions.objects.create(
        activity_data_record=adr,
        temperature=weather.temperature,
        cloud_cover=(
            CloudCoverCode.objects.get(code=weather.cloud_cover_code)
            if weather.cloud_cover_code is not None
            else None
        ),
        precipitation=(
            PrecipitationCode.objects.get(code=weather.precipitation_code)
            if weather.precipitation_code is not None
            else None
        ),
        wind_speed_kmh=weather.wind_speed,
        wind_direction=wd_code,
        comments=weather.weather_comments,
    )
