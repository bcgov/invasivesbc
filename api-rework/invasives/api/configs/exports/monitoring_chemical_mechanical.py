from django.db.models import F
from .helpers import agg

"""
Monitoring Annotations are Identical between Mechanical and Chemical Treatments
"""
MONITORING_ANNOTATIONS = [
    {
        "header": "Invasive Plant",
        "key": "invasive_plant_display",
        "annotation": F("invasive_plant__full"),
    },
    {
        "header": "Treatment Efficacy Rating",
        "key": "efficacy_display",
        "annotation": F("treatment_efficacy_rating__full"),
    },
    {
        "header": "Management Efficacy Rating",
        "key": "management_efficacy_display",
        "annotation": F("management_efficacy_rating__full"),
    },
    {
        "header": "Evidence of Treatment",
        "key": "treatment_evidence_display",
        "annotation": F("evidence_of_treatment"),
    },
    {
        "header": "Invasive Plants on Site",
        "key": "invasive_plant_on_site_display",
        "annotation": agg(
            f"root_activity__activitydatarecord__invasiveplantsonsite__invasive_plants_on_site__full",
        ),
    },
    {
        "header": "Treatment Pass",
        "key": "treatment_pass_display",
        "annotation": F("treatment_pass"),
    },
    {
        "header": "Monitoring Comment",
        "key": "monitoring_comment",
        "annotation": F("comment"),
    },
]
