from django.db.models import (
    CharField,
    Q,
    Sum,
)
from django.db.models.functions import Cast
from ..helpers import agg

ROOT = f"root_activity__activitydatarecord"
BC = f"{ROOT}__terrestrialbiocontrolagentcount"
BCE = f"{ROOT}__terrestrialbiocontrolagentcountextended"

BC_ACTUAL = Q(**{f"{BC}__is_estimate": False})
BC_ESTIMATE = Q(**{f"{BC}__is_estimate": True})

BCE_ACTUAL = Q(**{f"{BCE}__is_estimate": False})
BCE_ESTIMATE = Q(**{f"{BCE}__is_estimate": True})

AGENT_COUNT_ANNOTATIONS = [
    {
        "header": "Agent Lifestage (Actual)",
        "key": "actual_biological_agent_stage_display",
        "annotation": agg(f"{BC}__stage__full", filter=BC_ACTUAL),
    },
    {
        "header": "Agent Count (Actual)",
        "key": "actual_agent_count_display",
        "annotation": agg(
            Cast(
                f"{BC}__quantity",
                CharField(),
            ),
            filter=BC_ACTUAL,
        ),
    },
    {
        "header": "Agent Lifestage (Estimated)",
        "key": "estimated_biological_agent_stage_display",
        "annotation": agg(f"{BC}__stage__full", filter=BC_ESTIMATE),
    },
    {
        "header": "Agent Count (Estimated)",
        "key": "estimated_agent_count_display",
        "annotation": agg(
            Cast(
                f"{BC}__quantity",
                CharField(),
            ),
            filter=BC_ESTIMATE,
        ),
    },
    {
        "header": "Total Agent Quantity (Actual)",
        "key": "total_agent_quantity_actual_display",
        "annotation": Sum(f"{BC}__quantity", filter=BC_ACTUAL),
    },
    {
        "header": "Total Agent Quantity (Estimated)",
        "key": "total_agent_quantity_estimated_display",
        "annotation": Sum(f"{BC}__quantity", filter=BC_ESTIMATE),
    },
]
EXTENDED_AGENT_COUNT_ANNOTATIONS = [
    {
        "header": "Agent Lifestage (Actual)",
        "key": "actual_biological_agent_stage_display",
        "annotation": agg(f"{BCE}__stage__full", filter=BCE_ACTUAL),
    },
    {
        "header": "Agent Count (Actual)",
        "key": "actual_agent_count_display",
        "annotation": agg(
            Cast(
                f"{BCE}__quantity",
                CharField(),
            ),
            filter=BCE_ACTUAL,
        ),
    },
    {
        "header": "Plant Position (Actual)",
        "key": "actual_plant_position_display",
        "annotation": agg(f"{BCE}__plant_position__full", filter=BCE_ACTUAL),
    },
    {
        "header": "Agent Location (Actual)",
        "key": "actual_agent_location_display",
        "annotation": agg(f"{BCE}__agent_location__full", filter=BCE_ACTUAL),
    },
    {
        "header": "Agent Lifestage (Estimated)",
        "key": "estimated_biological_agent_stage_display",
        "annotation": agg(f"{BCE}__stage__full", filter=BCE_ESTIMATE),
    },
    {
        "header": "Agent Count (Estimated)",
        "key": "estimated_agent_count_display",
        "annotation": agg(
            Cast(
                f"{BCE}__quantity",
                CharField(),
            ),
            filter=BCE_ESTIMATE,
        ),
    },
    {
        "header": "Plant Position (Estimated)",
        "key": "estimated_plant_position_display",
        "annotation": agg(f"{BCE}__plant_position__full", filter=BCE_ESTIMATE),
    },
    {
        "header": "Agent Location (Estimated)",
        "key": "estimated_agent_location_display",
        "annotation": agg(f"{BCE}__agent_location__full", filter=BCE_ESTIMATE),
    },
    {
        "header": "Total Agent Quantity (Actual)",
        "key": "total_agent_quantity_actual_display",
        "annotation": Sum(f"{BCE}__quantity", filter=BCE_ACTUAL),
    },
    {
        "header": "Total Agent Quantity (Estimated)",
        "key": "total_agent_quantity_estimated_display",
        "annotation": Sum(f"{BCE}__quantity", filter=BCE_ESTIMATE),
    },
]
