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

    SUBTYPE_CSV_COLUMNS = [
        {"key": "mesoslope_position", "label": "Mesoslope Position"},
        {"key": "site_surface_shape", "label": "Site Surface Shape"},
        {"key": "invasive_plant", "label": "Invasive Plant"},
        {"key": "biological_agent", "label": "Biological Agent"},
        {"key": "linear_segment", "label": "Linear Segment"},
        {"key": "agent_mortality", "label": "Agent Mortality"},
        {"key": "agent_source", "label": "Agent Source"},
        {"key": "collection_date", "label": "Date of Collection"},
        {"key": "plant_collected_from", "label": "Plant Agent Collected From"},
        {
            "key": "plant_collected_from_unlisted",
            "label": "Plant Agent Collected From (Unlisted)",
        },
    ]
