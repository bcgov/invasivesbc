from django.db.models import (
    F,
    Value,
    CharField,
    Case,
    When,
    Func,
)
from django.db.models.functions import Cast
from .helpers import agg

ROOT = f"root_activity__activitydatarecord"
WEATHER = f"{ROOT}__weatherconditions"
MS = f"{ROOT}__micrositecondition"

# Dispersal and Release Monitoring share the same Entries

MONITORING_BIOCONTROL_DISPERSAL_RELEASE_ANNOTATIONS = [
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
        "header": "Biocontrol Present",
        "key": "biocontrol_present_display",
        "annotation": Case(
            When(**{f"biocontrol_present": True}, then=Value("Yes")),
            When(**{f"biocontrol_present": False}, then=Value("No")),
            default=Value("No"),
            output_field=CharField(),
        ),
    },
    {
        "header": "Biological Agent Presence",
        "key": "biological_agent_presence_display",
        "annotation": agg(
            f"{ROOT}__signofbiocontrolpresenceterrestrial__sign_of_presence__full"
        ),
    },
    {
        "header": "Type of Monitoring",
        "key": "monitoring_type_display",
        "annotation": F(f"monitoring_type"),
    },
    {
        "header": "Plant Count",
        "key": "plant_count_display",
        "annotation": Cast(F(f"plant_count"), CharField()),
    },
    {
        "header": "Count Duration (minutes)",
        "key": "count_duration_display",
        "annotation": F("count_duration_minutes"),
    },
    {
        "header": "Monitoring Method",
        "key": "monitoring_method_display",
        "annotation": F(f"monitoring_method__full"),
    },
    {
        "header": "Monitoring Start Time",
        "key": "start_time_display",
        "annotation": Func(
            f"start_time",
            Value("YYYY-MM-DD HH24:MI"),
            function="to_char",
            output_field=CharField(),
        ),
    },
    {
        "header": "Monitoring End Time",
        "key": "stop_time_display",
        "annotation": Func(
            f"stop_time",
            Value("YYYY-MM-DD HH24:MI"),
            function="to_char",
            output_field=CharField(),
        ),
    },
    {
        "header": "Location Agents Found",
        "key": "location_agent_found_display",
        "annotation": agg(
            f"{ROOT}__locationbiocontrolagentsfoundterrestrial__location_agent_found__full"
        ),
    },
]
