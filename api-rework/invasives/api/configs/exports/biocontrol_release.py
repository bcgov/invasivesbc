from django.db.models import (
    F,
    Value,
    CharField,
    Func,
)
from .helpers import agg

ROOT = f"root_activity__activitydatarecord"
MS = f"{ROOT}__micrositecondition"

BIOCONTROL_RELEASE_ANNOTATIONS = [
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
        "annotation": agg(f"invasive_plant__full"),
    },
    {
        "header": "Biological Agent",
        "key": "biological_agent_display",
        "annotation": agg(f"biocontrol_agent__full"),
    },
    {
        "header": "Linear Segment",
        "key": "linear_segment_display",
        "annotation": F(f"linear_segment"),
    },
    {
        "header": "Agent Mortality",
        "key": "mortality_display",
        "annotation": F(f"mortality"),
    },
    {
        "header": "Agent Source",
        "key": "agent_source_display",
        "annotation": F(f"agent_source"),
    },
    {
        "header": "Date of Collection",
        "key": "collection_date_display",
        "annotation": Func(
            f"collection_date",
            Value("YYYY-MM-DD HH24:MI"),
            function="to_char",
            output_field=CharField(),
        ),
    },
    {
        "header": "Plant Agent Collected From",
        "key": "plant_collected_from_display",
        "annotation": F(f"plant_collected_from__full"),
    },
    {
        "header": "Plant Agent Collected From (Unlisted)",
        "key": "plant_collected_from_unlisted_display",
        "annotation": F(f"plant_collected_from_manual"),
    },
]
