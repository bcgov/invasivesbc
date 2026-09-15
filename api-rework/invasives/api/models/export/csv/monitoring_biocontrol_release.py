from . import BaseCsvExportModel
from django.db import models
from api.models.enums import YesNo


class MonitoringBiocontrolReleasePlant(BaseCsvExportModel):
    temperature_c = models.PositiveIntegerField(blank=True, null=True)
    cloud_cover = models.CharField(blank=True, null=True)
    precipitation = models.CharField(blank=True, null=True)
    wind_speed_kmh = models.PositiveIntegerField(blank=True, null=True)
    wind_direction = models.CharField(blank=True, null=True)
    weather_comments = models.CharField(blank=True, null=True)
    mesoslope_position = models.CharField(blank=True, null=True)
    site_surface_shape = models.CharField(blank=True, null=True)
    invasive_plant = models.CharField(blank=True, null=True)
    biological_agent = models.CharField(blank=True, null=True)
    biocontrol_present = models.CharField(choices=YesNo, blank=True, null=True)
    biological_agent_presence = models.CharField(blank=True, null=True)
    monitoring_type = models.CharField(blank=True, null=True)
    plant_count = models.PositiveBigIntegerField(blank=True, null=True)
    count_duration = models.PositiveBigIntegerField(blank=True, null=True)
    monitoring_method = models.CharField(blank=True, null=True)
    monitoring_start_time = models.DateTimeField(blank=True, null=True)
    monitoring_stop_time = models.DateTimeField(blank=True, null=True)
    location_agents_found = models.CharField(blank=True, null=True)
    actual_biological_agent_stage = models.CharField(blank=True, null=True)
    actual_agent_count = models.CharField(blank=True, null=True)
    actual_plant_position = models.CharField(blank=True, null=True)
    actual_agent_location = models.CharField(blank=True, null=True)
    estimated_biological_agent_stage = models.CharField(blank=True, null=True)
    estimated_agent_count = models.CharField(blank=True, null=True)
    estimated_plant_position = models.CharField(blank=True, null=True)
    estimated_agent_location = models.CharField(blank=True, null=True)
    actual_total_agent_quantity = models.PositiveBigIntegerField(blank=True, null=True)
    estimated_total_agent_quantity = models.PositiveBigIntegerField(
        blank=True, null=True
    )
    phenology_details_recorded = models.CharField(choices=YesNo)
    target_plant_heights = models.CharField(blank=True, null=True)
    winter_dormant = models.FloatField(blank=True, null=True)
    seedlings = models.FloatField(blank=True, null=True)
    rosettes = models.FloatField(blank=True, null=True)
    bolts = models.FloatField(blank=True, null=True)
    flowering = models.FloatField(blank=True, null=True)
    seeds_forming = models.FloatField(blank=True, null=True)
    senescent = models.FloatField(blank=True, null=True)
    spread_results_recorded = models.CharField(choices=YesNo)
    agent_density = models.FloatField(blank=True, null=True)
    plant_attack_percent = models.FloatField(blank=True, null=True)
    max_spread_distance_m = models.FloatField(blank=True, null=True)
    max_spread_aspect_deg = models.FloatField(blank=True, null=True)

    class Meta:
        db_table = '"exports"."monitoring_biocontrol_release_p"'
        db_table_comment = "CSV Export for Monitoring Biocontrol Releases"
