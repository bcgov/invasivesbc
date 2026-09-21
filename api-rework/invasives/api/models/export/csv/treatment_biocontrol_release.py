from . import BaseCsvExportModel
from django.db import models


class TreatmentBiocontrolReleasePlant(BaseCsvExportModel):
    mesoslope_position = models.CharField(blank=True, null=True)
    site_surface_shape = models.CharField(blank=True, null=True)
    invasive_plant = models.CharField()
    biological_agent = models.CharField()
    linear_segment = models.CharField()
    agent_mortality = models.PositiveIntegerField()
    agent_source = models.CharField()
    collection_date = models.DateTimeField()
    plant_collected_from = models.CharField(blank=True, null=True)
    plant_collected_from_unlisted = models.CharField(blank=True, null=True)
    actual_biological_agent_stage = models.CharField(blank=True, null=True)
    actual_agent_count = models.CharField(blank=True, null=True)
    estimated_biological_agent_stage = models.CharField(blank=True, null=True)
    estimated_agent_count = models.CharField(blank=True, null=True)
    actual_total_agent_quantity = models.PositiveBigIntegerField(blank=True, null=True)
    estimated_total_agent_quantity = models.PositiveBigIntegerField(
        blank=True, null=True
    )

    class Meta:
        db_table = '"exports"."treatment_biocontrol_release_p"'
        db_table_comment = "CSV Export for Plant Biocontrol Releases"

    SUBTYPE_CSV_COLUMNS = [
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
            "key": "linear_segment",
            "label": "Linear Segment",
        },
        {
            "key": "agent_mortality",
            "label": "Agent Mortality",
        },
        {
            "key": "agent_source",
            "label": "Agent Source",
        },
        {
            "key": "collection_date",
            "label": "Date of Collection",
        },
        {
            "key": "plant_collected_from",
            "label": "Plant Agent Collected From",
        },
        {
            "key": "plant_collected_from_unlisted",
            "label": "Plant Agent Collected From (Unlisted)",
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
    ]
