from . import BaseCsvExportModel
from django.db import models
from api.models.enums import YesNo, ObservationType


class ObservationPlantTerrestrial(BaseCsvExportModel):
    aspect = models.CharField(null=True, blank=True)
    density = models.CharField(null=True, blank=True)
    distribution = models.CharField(null=True, blank=True)
    has_voucher_specimen = models.CharField(choices=YesNo)
    invasive_plant = models.CharField(null=True, blank=True)
    life_stage = models.CharField(null=True, blank=True)
    observation_type = models.CharField()
    pretreatment_observation = models.CharField(choices=ObservationType)
    research_observation = models.CharField(null=True, blank=True)
    slope_percent = models.CharField(null=True, blank=True)
    soil_texture = models.CharField(null=True, blank=True)
    specific_use = models.CharField(null=True, blank=True)
    suitable_for_biocontrol_agent = models.CharField(null=True, blank=True)
    visible_well_nearby = models.CharField(null=True, blank=True)

    class Meta:
        db_table = '"exports"."observation_pt"'
        db_table_comment = "CSV Export for Terrestrial Plant Observations"
