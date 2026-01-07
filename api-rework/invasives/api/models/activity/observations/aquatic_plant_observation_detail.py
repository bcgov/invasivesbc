from django.db import models
from django.core.exceptions import ValidationError
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from api.models.codes.code_tables import (
    DensityCode,
    DistributionCode,
    AquaticPlantCode,
    PlantLifeStageCode,
)
from api.models.enums.observation_type import ObservationType


class AquaticPlantObservationDetail(BaseOneToManyActivityTable):
    invasive_plant = models.ForeignKey(AquaticPlantCode, on_delete=models.PROTECT)
    density = models.ForeignKey(
        DensityCode, on_delete=models.PROTECT, blank=True, null=True
    )
    distribution = models.ForeignKey(
        DistributionCode, on_delete=models.PROTECT, blank=True, null=True
    )
    life_stage = models.ForeignKey(
        PlantLifeStageCode, on_delete=models.PROTECT, blank=True, null=True
    )
    observation_type = models.CharField(choices=ObservationType)
    sample_point_id = models.CharField(max_length=128, blank=True, null=True)

    class Meta:
        db_table = '"activity"."aquatic_plant_observation_detail"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity_id", "invasive_plant"],
                name="aquaticplant_observation_detail_unique_plant",
            )
        ]

    def clean(self):
        super().clean()
        requirements = {
            ObservationType.Positive: {
                "density": True,
                "distribution": True,
                "life_stage": True,
            },
            ObservationType.Negative: {
                "density": False,
                "distribution": False,
                "life_stage": False,
            },
        }
        required_config = requirements.get(self.observation_type, {})
        errors = {}

        for field, should_exist in required_config.items():
            value = getattr(self, field)
            if should_exist and not value:
                errors[field] = (
                    f"{field.replace('_', ' ').title()} cannot be null when observation is positive"
                )
            elif not should_exist and value is not None:
                errors[field] = (
                    f"A negative observation cannot have a {field.replace('_', ' ')}"
                )

        if errors:
            raise ValidationError(errors)
