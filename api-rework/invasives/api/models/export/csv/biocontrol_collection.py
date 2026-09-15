from . import BaseCsvExportModel
from django.db import models
from api.models.enums import YesNo


class BiocontrolCollectionPlant(BaseCsvExportModel):
    # Weather
    temperature_c = models.PositiveIntegerField(blank=True, null=True)
    cloud_cover = models.CharField(blank=True, null=True)
    precipitation = models.CharField(blank=True, null=True)
    wind_speed_kmh = models.PositiveIntegerField(blank=True, null=True)
    wind_direction = models.CharField(blank=True, null=True)
    weather_comments = models.CharField(blank=True, null=True)
    # Microsite
    mesoslope_position = models.CharField(blank=True, null=True)
    site_surface_shape = models.CharField(blank=True, null=True)
    # Entry
    invasive_plant = models.CharField(blank=True, null=True)
    biological_agent = models.CharField(blank=True, null=True)
    historical_iapp_site = models.PositiveIntegerField(blank=True, null=True)
    collection_type = models.CharField(blank=True, null=True)
    plant_count_collection = models.PositiveIntegerField(blank=True, null=True)
    time_collection_duration_minutes = models.PositiveIntegerField(
        blank=True, null=True
    )
    collection_method = models.CharField(blank=True, null=True)
    number_of_sweeps = models.PositiveIntegerField(blank=True, null=True)
    start_time_collecting = models.DateTimeField(blank=True, null=True)
    end_time_collecting = models.DateTimeField(blank=True, null=True)
    comment = models.CharField(blank=True, null=True)
    # Agent Count
    actual_biological_agent_stage = models.CharField(blank=True, null=True)
    actual_agent_count = models.CharField(blank=True, null=True)
    estimated_biological_agent_stage = models.CharField(blank=True, null=True)
    estimated_agent_count = models.CharField(blank=True, null=True)
    actual_total_agent_quantity = models.PositiveBigIntegerField(blank=True, null=True)
    estimated_total_agent_quantity = models.PositiveBigIntegerField(
        blank=True, null=True
    )
    # Phenology
    phenology_details_recorded = models.CharField(choices=YesNo)
    target_plant_heights = models.CharField(blank=True, null=True)
    winter_dormant = models.FloatField(blank=True, null=True)
    seedlings = models.FloatField(blank=True, null=True)
    rosettes = models.FloatField(blank=True, null=True)
    bolts = models.FloatField(blank=True, null=True)
    flowering = models.FloatField(blank=True, null=True)
    seeds_forming = models.FloatField(blank=True, null=True)
    senescent = models.FloatField(blank=True, null=True)

    class Meta:
        db_table = '"exports"."biocontrol_collection_p"'
        db_table_comment = "CSV Export for Monitoring Biocontrol Releases"
