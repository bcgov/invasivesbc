from django.db import models
from django.core.exceptions import ValidationError
from api.models.activity import UnrepeatedFormData, DraftUnrepeatedFormData
from api.models.codes import WindDirectionCode
from api.models.codes.code_tables import CloudCoverCode, PrecipitationCode


class BaseModel(models.Model):
    """
    Weather Condition Details for Activity
    consumed by:
      - Biocontrol Dispersal Monitoring
      - Biocontrol Release Monitoring
      - Biocontrol Collection
      - Biocontrol Release
    """

    temperature = models.PositiveSmallIntegerField()
    cloud_cover = models.ForeignKey(CloudCoverCode, on_delete=models.PROTECT)
    precipitation = models.ForeignKey(PrecipitationCode, on_delete=models.PROTECT)
    wind_speed_kmh = models.PositiveSmallIntegerField()
    wind_direction = models.ForeignKey(WindDirectionCode, on_delete=models.PROTECT)
    comments = models.TextField(max_length=16384, null=True, blank=True)

    class Meta:
        abstract = True


class WeatherConditions(BaseModel, UnrepeatedFormData):

    class Meta:
        db_table = '"activity"."weather_conditions"'

    def clean(self):
        if (
            self.wind_direction is None or self.wind_direction.code == "No Wind"
        ) and self.wind_speed_kmh > 0:
            raise ValidationError(
                {"wind_direction": "Must specify a wind direction when wind speed > 0"}
            )


class DraftWeatherConditions(BaseModel, DraftUnrepeatedFormData):
    """
    Weather Condition Details for Activity
    consumed by:
      - Biocontrol Dispersal Monitoring
      - Biocontrol Release Monitoring
      - Biocontrol Collection
      - Biocontrol Release
    """

    temperature = models.PositiveSmallIntegerField(blank=True, null=True)
    cloud_cover = models.ForeignKey(
        CloudCoverCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    precipitation = models.ForeignKey(
        PrecipitationCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    wind_speed_kmh = models.PositiveSmallIntegerField(
        blank=True,
        null=True,
    )
    wind_direction = models.ForeignKey(
        WindDirectionCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"draft_activity"."weather_conditions"'
