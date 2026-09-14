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
    waterbody_type = models.CharField(null=True, blank=True)
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
    water_colour = models.CharField(null=True, blank=True)
    tidal_influence = models.CharField(choices=YesNoUnknown, null=True, blank=True)
    has_voucher_specimen = models.CharField(choices=YesNo)
    pretreatment_observation = models.CharField(
        choices=YesNoUnknown, null=True, blank=True
    )
    substrate_type = models.CharField(null=True, blank=True)
    adjacent_land_use = models.CharField(null=True, blank=True)

    class Meta:
        db_table = '"exports"."observation_pa"'
        db_table_comment = "CSV Export for Aquatic Plant Observations"
