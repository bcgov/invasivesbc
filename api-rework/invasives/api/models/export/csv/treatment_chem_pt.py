from . import BaseCsvExportModel
from django.db import models
from api.models.enums import YesNo


class TreatmentChemicalPlantTerrestrial(BaseCsvExportModel):
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
    pesticide_use_permit = models.CharField(blank=True, null=True)
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
        db_table = '"exports"."treatment_chemical_pt"'
        db_table_comment = "CSV Export for Terrestrial Plant Chemical Treatments"

    SUBTYPE_CSV_COLUMNS = [
        {"key": "well_proximity_m", "label": "Nearest Well Proximity (m)"},
        {"key": "service_license", "label": "Service License"},
        {"key": "pesticide_use_permit", "label": "Pesticide Use Permit"},
        {"key": "pest_management_plan", "label": "Pest Management Plan"},
        {"key": "pmp_not_in_dropdown", "label": "Pest Management Plan (Manual Entry)"},
        {"key": "temperature_c", "label": "Temperature (C)"},
        {"key": "wind_speed_kmh", "label": "Wind Speed (km/h)"},
        {"key": "wind_direction", "label": "Wind Direction"},
        {"key": "humidity", "label": "Humidity (%)"},
        {"key": "treatment_notice_signs", "label": "Treatment Notice Signs Left"},
        {"key": "application_start_time", "label": "Application Start Time"},
        {
            "key": "pest_injury_threshold",
            "label": "Pest Injury Threshold Determination",
        },
        {"key": "invasive_plant", "label": "Invasive Plant"},
        {
            "key": "invasive_plant_percent_covered",
            "label": "Invasive Plant Percent Covered",
        },
        {"key": "tank_mix_used", "label": "Tank Mix Used"},
        {"key": "chemical_application_method", "label": "Chemical Application Method"},
        {"key": "herbicide_type", "label": "Herbicide Type"},
        {"key": "herbicide_name", "label": "Herbicide"},
        {"key": "calculation_type", "label": "Calculation Type"},
        {"key": "delivery_rate_of_mix", "label": "Delivery Rate of Mix (L/ha)"},
        {
            "key": "product_application_rate",
            "label": "Product Application Rate (L/ha,g/ha)",
        },
        {"key": "dilution_percent", "label": "Dilution (%)"},
        {
            "key": "undiluted_herbicide_used_l",
            "label": "Amount of Undiluted Herbicide Used (L)",
        },
        {"key": "area_treated_sqm", "label": "Area Treated (sqm)"},
        {"key": "amount_of_mix_used", "label": "Amount of Mix Used (L)"},
        {"key": "percent_area_covered", "label": "Percent Area Covered"},
    ]
