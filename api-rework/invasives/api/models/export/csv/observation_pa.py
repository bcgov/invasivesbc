from . import BaseCsvExportModel
from django.db import models
from api.models.enums import ObservationType, YesNo, YesNoUnknown


class ObservationPlantAquatic(BaseCsvExportModel):
    observation_type = models.CharField(choices=ObservationType)
    sample_point_id = models.CharField(null=True, blank=True)
    invasive_plant = models.CharField()
    life_stage = models.CharField(null=True, blank=True)
    density = models.CharField(null=True, blank=True)
    distribution = models.CharField(null=True, blank=True)
    suitable_for_biocontrol = models.CharField(choices=YesNoUnknown)
    shorelines = models.CharField(null=True, blank=True)
    waterbody_type = models.CharField()
    name_gazetted = models.CharField(null=True, blank=True)
    name_local = models.CharField(null=True, blank=True)
    waterbody_access = models.CharField(null=True, blank=True)
    water_use = models.CharField(null=True, blank=True)
    water_level_management = models.CharField(null=True, blank=True)
    outflow_seasonal = models.CharField(null=True, blank=True)
    outflow_permanent = models.CharField(null=True, blank=True)
    inflow_seasonal = models.CharField(null=True, blank=True)
    inflow_permanent = models.CharField(null=True, blank=True)
    waterbody_comment = models.CharField(null=True, blank=True)
    sample_water_depth_m = models.CharField(null=True, blank=True)
    secchi_depth_m = models.FloatField(null=True, blank=True)
    water_colour = models.CharField()
    tidal_influence = models.CharField(choices=YesNoUnknown, null=True, blank=True)
    has_voucher_specimen = models.CharField(choices=YesNo)
    pretreatment_observation = models.CharField(choices=YesNoUnknown)
    substrate_type = models.CharField()
    adjacent_land_use = models.CharField(null=True, blank=True)

    class Meta:
        db_table = '"exports"."observation_pa"'
        db_table_comment = "CSV Export for Aquatic Plant Observations"

    SUBTYPE_CSV_COLUMNS = [
        {
            "key": "observation_type",
            "label": "Observation Type",
        },
        {
            "key": "sample_point_id",
            "label": "Sample Point ID",
        },
        {
            "key": "invasive_plant",
            "label": "Invasive Plant",
        },
        {
            "key": "life_stage",
            "label": "Life Stage",
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
            "key": "suitable_for_biocontrol",
            "label": "Suitable for Biocontrol",
        },
        {
            "key": "shorelines",
            "label": "Shorelines",
        },
        {
            "key": "waterbody_type",
            "label": "Waterbody Type",
        },
        {
            "key": "name_gazetted",
            "label": "Name (Gazetted)",
        },
        {
            "key": "name_local",
            "label": "Name (Local)",
        },
        {
            "key": "waterbody_access",
            "label": "Waterbody Access",
        },
        {
            "key": "water_use",
            "label": "Water Use",
        },
        {
            "key": "water_level_management",
            "label": "Water Level Management",
        },
        {
            "key": "outflow_seasonal",
            "label": "Outflow (Seasonal)",
        },
        {
            "key": "outflow_permanent",
            "label": "Outflow (Permanent)",
        },
        {
            "key": "inflow_seasonal",
            "label": "Inflow (Seasonal)",
        },
        {
            "key": "inflow_permanent",
            "label": "Inflow (Permanent)",
        },
        {
            "key": "waterbody_comment",
            "label": "Waterbody Comment",
        },
        {
            "key": "sample_water_depth_m",
            "label": "Sample Water Depth (m)",
        },
        {
            "key": "secchi_depth_m",
            "label": "Secchi Depth (m)",
        },
        {
            "key": "water_colour",
            "label": "Water Colour",
        },
        {
            "key": "tidal_influence",
            "label": "Tidal Influence",
        },
        {
            "key": "has_voucher_specimen",
            "label": "Voucher Specimen",
        },
        {
            "key": "pretreatment_observation",
            "label": "Pre-treatment Observation",
        },
        {
            "key": "substrate_type",
            "label": "Substrate Type",
        },
        {
            "key": "adjacent_land_use",
            "label": "Adjacent Land Use",
        },
    ]
