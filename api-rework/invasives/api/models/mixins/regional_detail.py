from django.core.exceptions import ValidationError
from django.db import models


class ComputedLocationFields(models.Model):
    """
    Non-User submitted Fields. Generated after an activity submission based on latest geo data
    """

    computed_fields_generated = models.BooleanField(
        null=False,
        default=False,
        db_column="computed_fields_generated",
        db_comment="Whether or not computed regional details have been generated",
    )

    computed_biogeoclimatic_zone = models.CharField(
        blank=True,
        db_comment="Large geographic area defined by similar regional climate (temperature, rainfall, moisture)",
        max_length=128,
        null=True,
    )
    computed_elevation_m = models.SmallIntegerField(
        blank=True, db_comment="Estimated elevation of an area in meters", null=True
    )
    computed_flrno_districts = models.CharField(blank=True, max_length=128, null=True)
    computed_invasive_plant_management_areas = models.CharField(
        blank=True, max_length=128, null=True
    )
    computed_moti_districts = models.CharField(
        blank=True,
        null=True,
        db_comment="Ministry of Transportation and Infrastructure (MOTI)",
        max_length=128,
    )
    computed_ownership = models.CharField(blank=True, max_length=64, null=True)
    computed_regional_districts = models.CharField(
        blank=True, max_length=128, null=True
    )

    class Meta:
        abstract = True

    def clean(self):
        super().clean()
        if self.computed_fields_generated:
            if (
                not self.computed_biogeoclimatic_zone
                and not self.computed_invasive_plant_management_areas
                and not self.computed_ownership
                and not self.computed_regional_districts
                and not self.computed_flrno_districts
                and not self.computed_moti_districts
                and not self.computed_elevation_m
            ):
                raise ValidationError(
                    "At least one value other than activity must be non-null if generation has been completed",
                    code="invalid",
                )
