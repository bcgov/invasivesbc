from django.db import models
from django.core.exceptions import ValidationError
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable


class RegionalDetail(BaseOneToOneActivityTable):
    """
    Non-User submitted Fields. Generated after an activity submission based on latest geo data
    """

    biogeoclimatic_zone = models.CharField(
        blank=True,
        db_comment="Large geographic area defined by similar regional climate (temperature, rainfall, moisture)",
        max_length=128,
    )
    elevation_m = models.SmallIntegerField(
        blank=True, db_comment="Estimated elevation of an area in meters"
    )
    flrno_districts = models.CharField(blank=True, max_length=128)
    invasive_plant_management_areas = models.CharField(blank=True, max_length=128)
    moti_districts = models.CharField(
        blank=True,
        null=True,
        db_comment="Ministry of Transportation and Infrastructure (MOTI)",
        max_length=128,
    )
    ownership = models.CharField(blank=True, max_length=64)
    regional_districts = models.CharField(blank=True, max_length=128)

    class Meta:
        db_table = '"activity"."regional_detail"'
        db_table_comment = "Regional Details for an Activity Record. Contains autofilled information based on the forms Geometry"

    def __str__(self):
        return f"{self.activity_id.short_id}"

    def clean(self):
        super().clean()
        if (
            not self.biogeoclimatic_zone
            and not self.invasive_plant_management_areas
            and not self.ownership
            and not self.regional_districts
            and not self.flrno_districts
            and not self.moti_districts
            and not self.elevation_m
        ):
            raise ValidationError(
                _("At least one value other than activity_id must be non-null"),
                code="invalid",
            )
