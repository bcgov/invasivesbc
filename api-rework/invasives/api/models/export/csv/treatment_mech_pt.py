from . import BaseCsvExportModel
from django.db import models


class TreatmentMechanicalPlantTerrestrial(BaseCsvExportModel):
    invasive_plant = models.CharField(null=True, blank=True)
    treated_area_sqm = models.CharField(null=True, blank=True)
    mechanical_method = models.CharField(null=True, blank=True)
    disposal_method = models.CharField(null=True, blank=True)
    disposed_material_format = models.CharField(null=True, blank=True)
    disposed_material_amount = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = '"exports"."treatment_mech_pt"'
        db_table_comment = "CSV Export for Terrestrial Plant Mechanical Treatments"
