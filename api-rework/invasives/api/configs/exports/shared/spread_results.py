from django.db.models import (
    Value,
    CharField,
    Exists,
    OuterRef,
    Max,
    Case,
    When,
)
from django.db.models.functions import Cast
from ..helpers import agg
from api.models.activity import SpreadResults

ROOT = f"root_activity__activitydatarecord"
SR = f"{ROOT}__spreadresults"

spread_results_exists_subquery = Exists(
    SpreadResults.objects.filter(activity_data_record_id=OuterRef(f"{ROOT}__id"))
)

SPREAD_RESULTS_ANNOTATIONS = [
    {
        "header": "Spread Details Recorded",
        "key": "spread_details_recorded_display",
        "annotation": Max(
            Case(
                When(spread_results_exists_subquery, then=Value("Yes")),
                default=Value("No"),
                output_field=CharField(),
            )
        ),
    },
    {
        "header": "Agent Density %",
        "key": "agent_density_display",
        "annotation": agg(Cast(f"{SR}__agent_density", CharField())),
    },
    {
        "header": "Plant Attack %",
        "key": "plant_attack_display",
        "annotation": agg(Cast(f"{SR}__plant_attack", CharField())),
    },
    {
        "header": "Max Spread Distance (M)",
        "key": "max_spread_distance_display",
        "annotation": agg(Cast(f"{SR}__max_spread_distance_m", CharField())),
    },
    {
        "header": "Max Spread Aspect (deg)",
        "key": "max_spread_aspect_display",
        "annotation": agg(Cast(f"{SR}__max_spread_aspect_deg", CharField())),
    },
]
