from . import BaseCsvExportModel
from django.db import models
from api.models.enums import YesNo


class TreatmentChemicalPlantAquatic(BaseCsvExportModel):
    well_proximity_m = models.FloatField(blank=True, null=True)
    service_license = models.CharField(blank=True, null=True)
    pest_management_plan = models.CharField(blank=True, null=True)
    pmp_not_in_dropdown = models.CharField(blank=True, null=True)
    temperature_c = models.FloatField(blank=True, null=True)
    wind_speed_kmh = models.FloatField(blank=True, null=True)
    wind_direction = models.CharField(blank=True, null=True)
    humidity = models.FloatField(blank=True, null=True)
    treatment_notice_signs = models.CharField(blank=True, null=True)
    application_start_time = models.DateTimeField(blank=True, null=True)
    pest_injury_threshold = models.CharField(choices=YesNo, blank=True, null=True)
    invasive_plant = models.CharField(blank=True, null=True)
    invasive_plant_percent_covered = models.FloatField(blank=True, null=True)
    tank_mix_used = models.CharField(choices=YesNo, blank=True, null=True)
    chemical_application_method = models.CharField(blank=True, null=True)
    herbicide_type = models.CharField(blank=True, null=True)
    herbicide_name = models.CharField(blank=True, null=True)
    calculation_type = models.CharField(blank=True, null=True)
    delivery_rate_of_mix = models.FloatField(blank=True, null=True)
    product_application_rate = models.FloatField(blank=True, null=True)
    dilution_percent = models.FloatField(blank=True, null=True)
    undiluted_herbicide_used_l = models.FloatField(blank=True, null=True)
    area_treated_sqm = models.FloatField(blank=True, null=True)
    amount_of_mix_used = models.FloatField(blank=True, null=True)
    percent_area_covered = models.FloatField(blank=True, null=True)

    class Meta:
        db_table = '"exports"."treatment_chemical_pa"'
        db_table_comment = "CSV Export for Aquatic Plant Chemical Treatments"
