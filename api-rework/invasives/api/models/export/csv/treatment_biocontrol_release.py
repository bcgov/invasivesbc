from . import BaseCsvExportModel
from django.db import models


class TreatmentBiocontrolReleasePlant(BaseCsvExportModel):
    mesoslope_position = models.CharField(blank=True, null=True)
    site_surface_shape = models.CharField(blank=True, null=True)
    invasive_plant = models.CharField(blank=True, null=True)
    biological_agent = models.CharField(blank=True, null=True)
    linear_segment = models.CharField(blank=True, null=True)
    agent_mortality = models.PositiveIntegerField(blank=True, null=True)
    agent_source = models.CharField(blank=True, null=True)
    collection_date = models.DateTimeField(blank=True, null=True)
    plant_collected_from = models.CharField(blank=True, null=True)
    plant_collected_from_unlisted = models.CharField(blank=True, null=True)

    class Meta:
        db_table = '"exports"."treatment_biocontrol_release_p"'
        db_table_comment = "CSV Export for Plant Biocontrol Releases"
