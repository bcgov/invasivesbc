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

    SUBTYPE_CSV_COLUMNS = [
        {
            "key": "pretreatment_observation",
            "label": "Pre-treatment Observation",
        },
        {
            "key": "soil_texture",
            "label": "Soil Texture",
        },
        {
            "key": "specific_use",
            "label": "Specific Use(s)",
        },
        {
            "key": "slope_percent",
            "label": "Slope Percent",
        },
        {
            "key": "aspect",
            "label": "Aspect",
        },
        {
            "key": "research_observation",
            "label": "Research Observation",
        },
        {
            "key": "visible_well_nearby",
            "label": "Visible Well Nearby",
        },
        {
            "key": "suitable_for_biocontrol_agent",
            "label": "Suitable for Biocontrol Agent",
        },
        {
            "key": "invasive_plant",
            "label": "Invasive Plant",
        },
        {
            "key": "observation_type",
            "label": "Observation Type",
        },
        {
            "key": "density",
            "label": "Density",
        },
        {
            "key": "distribution",
            "label": "Distribution",
        },
        {
            "key": "life_stage",
            "label": "Life Stage",
        },
        {
            "key": "has_voucher_specimen",
            "label": "Voucher Sample",
        },
    ]
