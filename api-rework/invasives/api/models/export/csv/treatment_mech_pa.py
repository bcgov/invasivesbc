from . import BaseCsvExportModel
from django.db import models


class TreatmentMechanicalPlantAquatic(BaseCsvExportModel):
    invasive_plant = models.CharField()
    treated_area_sqm = models.CharField()
    mechanical_method = models.CharField()
    disposal_method = models.CharField()
    disposed_material_format = models.CharField(null=True, blank=True)
    disposed_material_amount = models.FloatField(null=True, blank=True)
    shorelines = models.CharField(null=True, blank=True)
    authorization_information = models.CharField(null=True, blank=True)

    class Meta:
        db_table = '"exports"."treatment_mech_pa"'
        db_table_comment = "CSV Export for Aquatic Plant Mechanical Treatments"

    SUBTYPE_CSV_COLUMNS = [
        {"key": "invasive_plant", "label": "Invasive Plant"},
        {"key": "treated_area_sqm", "label": "Treated Area (sqm)"},
        {"key": "mechanical_method", "label": "Mechanical Method"},
        {"key": "disposal_method", "label": "Disposal Method"},
        {"key": "disposed_material_format", "label": "Disposed Material Format"},
        {"key": "disposed_material_amount", "label": "Disposed Material Amount"},
        {"key": "shorelines", "label": "Shorelines"},
        {"key": "authorization_information", "label": "Authorization Information"},
    ]
