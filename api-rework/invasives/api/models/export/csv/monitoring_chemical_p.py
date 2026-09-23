from . import BaseCsvExportModel
from django.db import models


class MonitoringChemicalPlant(BaseCsvExportModel):
    invasive_plant = models.CharField()
    treatment_efficacy = models.CharField(null=True, blank=True)
    management_efficacy = models.CharField(null=True, blank=True)
    treatment_evidence = models.CharField(null=True, blank=True)
    invasive_plants_on_site = models.CharField(null=True, blank=True)
    treatment_pass = models.CharField(null=True, blank=True)
    monitoring_comment = models.CharField(null=True, blank=True)

    class Meta:
        db_table = '"exports"."monitoring_chem_p"'
        db_table_comment = "CSV Export for Monitoring Chemical Plant Treatments"

    SUBTYPE_CSV_COLUMNS = [
        {
            "key": "invasive_plant",
            "label": "Invasive Plant",
        },
        {
            "key": "treatment_efficacy",
            "label": "Treatment Efficacy Rating",
        },
        {
            "key": "management_efficacy",
            "label": "Management Efficacy Rating",
        },
        {
            "key": "treatment_evidence",
            "label": "Evidence of Treatment",
        },
        {
            "key": "invasive_plants_on_site",
            "label": "Invasive Plants on Site",
        },
        {
            "key": "treatment_pass",
            "label": "Treatment Pass",
        },
        {
            "key": "monitoring_comment",
            "label": "Monitoring Comment",
        },
    ]
