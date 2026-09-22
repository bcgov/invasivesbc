from . import BaseCsvExportModel
from django.db import models
from api.models.enums import YesNo, YesNoUnknown


class MonitoringBiocontrolDispersal(BaseCsvExportModel):
    temperature_c = models.PositiveIntegerField()
    cloud_cover = models.CharField()
    precipitation = models.CharField()
    wind_speed_kmh = models.PositiveIntegerField()
    wind_direction = models.CharField()
    weather_comments = models.CharField(blank=True, null=True)
    mesoslope_position = models.CharField(blank=True, null=True)
    site_surface_shape = models.CharField(blank=True, null=True)
    invasive_plant = models.CharField()
    biological_agent = models.CharField()
    biocontrol_present = models.CharField()
    biological_agent_presence = models.CharField(blank=True, null=True)
    monitoring_type = models.CharField()
    plant_count = models.PositiveBigIntegerField(blank=True, null=True)
    count_duration = models.PositiveBigIntegerField(blank=True, null=True)
    linear_segment = models.CharField(choices=YesNoUnknown, blank=True, null=True)
    monitoring_method = models.CharField(blank=True, null=True)
    monitoring_start_time = models.DateTimeField()
    monitoring_stop_time = models.DateTimeField()
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

    class Meta:
        db_table = '"exports"."monitoring_biocontrol_dispersal_p"'
        db_table_comment = "CSV Export for Monitoring Biocontrol Releases"


SUBTYPE_CSV_COLUMNS = [
    {
        "key": "temperature_c",
        "label": "Temperature (C)",
    },
    {
        "key": "cloud_cover",
        "label": "Cloud Cover",
    },
    {
        "key": "precipitation",
        "label": "Precipitation",
    },
    {
        "key": "wind_speed_kmh",
        "label": "Wind Speed (Km)",
    },
    {
        "key": "wind_direction",
        "label": "Wind Direction",
    },
    {
        "key": "weather_comments",
        "label": "Weather Comments",
    },
    {
        "key": "mesoslope_position",
        "label": "Mesoslope Position",
    },
    {
        "key": "site_surface_shape",
        "label": "Site Surface Shape",
    },
    {
        "key": "invasive_plant",
        "label": "Invasive Plant",
    },
    {
        "key": "biological_agent",
        "label": "Biological Agent",
    },
    {
        "key": "biocontrol_present",
        "label": "Biocontrol Present",
    },
    {
        "key": "biological_agent_presence",
        "label": "Signs of Agent Presence",
    },
    {
        "key": "monitoring_type",
        "label": "Type of Monitoring",
    },
    {
        "key": "plant_count",
        "label": "Plant Count",
    },
    {
        "key": "count_duration",
        "label": "Count Duration (minutes)",
    },
    {
        "key": "linear_segment",
        "label": "Linear Segment",
    },
    {
        "key": "monitoring_method",
        "label": "Monitoring Method",
    },
    {
        "key": "monitoring_start_time",
        "label": "Monitoring Start Time",
    },
    {
        "key": "monitoring_stop_time",
        "label": "Monitoring End Time",
    },
    {
        "key": "location_agents_found",
        "label": "Location Agents Found",
    },
    {
        "key": "actual_biological_agent_stage",
        "label": "Agent Lifestage (Actual)",
    },
    {
        "key": "actual_agent_count",
        "label": "Agent Count (Actual)",
    },
    {
        "key": "actual_plant_position",
        "label": "Plant Position (Actual)",
    },
    {
        "key": "actual_agent_location",
        "label": "Agent Locaion (Actual)",
    },
    {
        "key": "estimated_biological_agent_stage",
        "label": "Agent Lifestage (Estimated)",
    },
    {
        "key": "estimated_agent_count",
        "label": "Agent Count (Estimated)",
    },
    {
        "key": "estimated_plant_position",
        "label": "Plant Position (Estimated)",
    },
    {
        "key": "estimated_agent_location",
        "label": "Agent Locaion (Estimated)",
    },
    {
        "key": "actual_total_agent_quantity",
        "label": "Total Agent Quantity (Actual)",
    },
    {
        "key": "estimated_total_agent_quantity",
        "label": "Total Agent Quantity (Estimated)",
    },
    {
        "key": "actual_biological_agent_stage",
        "label": "Agent Lifestage (Actual)",
    },
    {
        "key": "phenology_details_recorded",
        "label": "Phenology Details Recorded",
    },
    {
        "key": "target_plant_heights",
        "label": "Target Plant Heights",
    },
    {
        "key": "winter_dormant",
        "label": "Winter Dormant",
    },
    {
        "key": "seedlings",
        "label": "Seedlings",
    },
    {
        "key": "rosettes",
        "label": "Rosettes",
    },
    {
        "key": "bolts",
        "label": "Bolts",
    },
    {
        "key": "flowering",
        "label": "Flowering",
    },
    {
        "key": "seeds_forming",
        "label": "Seeds Forming",
    },
    {
        "key": "senescent",
        "label": "Senescent",
    },
]
