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
    invasive_plant = models.CharField()
    biological_agent = models.CharField()
    historical_iapp_site = models.PositiveIntegerField(blank=True, null=True)
    collection_type = models.CharField()
    plant_count_collection = models.PositiveIntegerField(blank=True, null=True)
    time_collection_duration_minutes = models.PositiveIntegerField(
        blank=True, null=True
    )
    collection_method = models.CharField()
    number_of_sweeps = models.PositiveIntegerField(blank=True, null=True)
    start_time_collecting = models.DateTimeField()
    end_time_collecting = models.DateTimeField()
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
            "key": "historical_iapp_site",
            "label": "Historical IAPP ID",
        },
        {
            "key": "collection_type",
            "label": "Collection Type",
        },
        {
            "key": "plant_count_collection",
            "label": "Plant Count",
        },
        {
            "key": "time_collection_duration_minutes",
            "label": "Count Duration (minutes)",
        },
        {
            "key": "collection_method",
            "label": "Collection Method",
        },
        {
            "key": "number_of_sweeps",
            "label": "Number of Sweeps",
        },
        {
            "key": "start_time_collecting",
            "label": "Start Time Collecting",
        },
        {
            "key": "end_time_collecting",
            "label": "Stop Time Collecting",
        },
        {
            "key": "comment",
            "label": "Collection Comment",
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
            "key": "estimated_biological_agent_stage",
            "label": "Agent Lifestage (Estimated)",
        },
        {
            "key": "estimated_agent_count",
            "label": "Agent Count (Estimated)",
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
