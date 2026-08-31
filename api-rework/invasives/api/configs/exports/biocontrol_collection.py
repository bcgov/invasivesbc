from django.db.models import (
    F,
    Value,
    CharField,
    Func,
)
from .helpers import agg

ROOT = f"root_activity__activitydatarecord"
MS = f"{ROOT}__micrositecondition"

BIOCONTROL_COLLECTION_ANNOTATIONS = [
    {
        "header": "Mesoslope Position",
        "key": "mesoslope_position_display",
        "annotation": agg(f"{MS}__mesoslope_position__full"),
    },
    {
        "header": "Site Surface Shape",
        "key": "site_surface_shape_display",
        "annotation": agg(f"{MS}__site_surface_shape__full"),
    },
    {
        "header": "Invasive Plant",
        "key": "invasive_plant_display",
        "annotation": F("invasive_plant__full"),
    },
    {
        "header": "Biological Agent",
        "key": "biological_agent_display",
        "annotation": F("biological_agent__full"),
    },
    {
        "header": "Historical IAPP ID",
        "key": "historical_iapp_site_id_display",
        "annotation": F("historical_iapp_site"),
    },
    {
        "header": "Collection Type",
        "key": "collection_type_display",
        "annotation": F("collection_type"),
    },
    {
        "header": "Plant Count",
        "key": "plant_count_display",
        "annotation": F("plant_count_collection"),
    },
    {
        "header": "Count Duration (minutes)",
        "key": "count_duration_display",
        "annotation": F("time_collection_duration_minutes"),
    },
    {
        "header": "Collection Method",
        "key": "collection_method_display",
        "annotation": F("collection_method__full"),
    },
    {
        "header": "Start Time Collecting",
        "key": "start_time_display",
        "annotation": Func(
            f"start_time_collecting",
            Value("YYYY-MM-DD HH24:MI"),
            function="to_char",
            output_field=CharField(),
        ),
    },
    {
        "header": "Stop Time Collecting",
        "key": "stop_time_display",
        "annotation": Func(
            f"end_time_collecting",
            Value("YYYY-MM-DD HH24:MI"),
            function="to_char",
            output_field=CharField(),
        ),
    },
]
