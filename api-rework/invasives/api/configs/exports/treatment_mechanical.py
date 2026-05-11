from django.db.models import F, Value, CharField, Value, Q
from django.db.models.functions import Cast, Concat
from .helpers import agg

ROOT = f"root_activity__activitydatarecord"
ST = f"{ROOT}__shorelinetypes"

TREATMENT_MECHANICAL_TERRESTRIAL_ANNOTATIONS = [
    {
        "header": "Invasive Plant",
        "key": "invasive_plant_display",
        "annotation": F("invasive_plant__full"),
    },
    {
        "header": "Treated Area (sqm)",
        "key": "treated_area_sqm_display",
        "annotation": F("treated_area_msq"),
    },
    {
        "header": "Mechanical Method",
        "key": "mechanical_method_display",
        "annotation": F("mechanical_method__full"),
    },
    {
        "header": "Disposal Method",
        "key": "disposal_method_display",
        "annotation": F("disposal_method__full"),
    },
    {
        "header": "Disposed Material Format",
        "key": "disposed_material_format_display",
        "annotation": F("disposed_material_format"),
    },
    {
        "header": "Disposed Material Amount",
        "key": "disposed_material_amount_display",
        "annotation": F("disposed_material_amount"),
    },
]


TREATMENT_MECHANICAL_AQUATIC_ANNOTATIONS = (
    TREATMENT_MECHANICAL_TERRESTRIAL_ANNOTATIONS
    + [
        {
            "header": "Authorization Information",
            "key": "authorization_information_display",
            "annotation": agg(
                f"{ROOT}__aquaticmechanicalauthorization__authorization_information"
            ),
        },
        {
            "header": "shorelines",
            "key": "shorelines_display",
            "annotation": agg(
                Concat(
                    f"{ST}__shoreline_type__full",
                    Value(" ("),
                    Cast(f"{ST}__percent_covered", CharField()),
                    Value("%)"),
                ),
                filter=Q(**{f"{ST}__shoreline_type__full__isnull": False}),
            ),
        },
    ]
)
