from django.db.models import F, Value, CharField, Case, When, Exists, OuterRef
from api.models.activity import (
    TerrestrialVoucherSpecimen,
)
from .helpers import agg

SRC = "root_activity"
ADR_PATH = f"{SRC}__activitydatarecord"
CTX_PATH = f"{ADR_PATH}__terrestrialplantobservationcontext"

voucher_exists_subquery = Exists(
    TerrestrialVoucherSpecimen.objects.filter(
        activity_data_record__activity_id=OuterRef(f"{SRC}__id")
    )
)

OBSERVATION_TERRESTRIAL_ANNOTATIONS = [
    {
        "header": "Pre-treatment Observation",
        "key": "pre_treatment_obs_display",
        "annotation": agg(
            f"{ADR_PATH}__pretreatmentobservation__pre_treatment_observation",
        ),
    },
    {
        "header": "Soil Texture",
        "key": "soil_texture_display",
        "annotation": agg(
            f"{CTX_PATH}__soil_texture__full",
        ),
    },
    {
        "header": "Specific Use(s)",
        "key": "specific_use_display",
        "annotation": agg(
            f"{ADR_PATH}__specificuse__specific_use__full",
        ),
    },
    {
        "header": "Slope Percent",
        "key": "slope_display",
        "annotation": agg(
            f"{CTX_PATH}__slope_percent__full",
        ),
    },
    {
        "header": "Aspect",
        "key": "aspect_display",
        "annotation": agg(
            f"{CTX_PATH}__aspect__full",
        ),
    },
    {
        "header": "Research Observation",
        "key": "research_observation_display",
        "annotation": agg(
            f"{CTX_PATH}__research_observation",
        ),
    },
    {
        "header": "Visible Well Nearby",
        "key": "well_nearby_display",
        "annotation": agg(
            f"{CTX_PATH}__visible_well_nearby",
        ),
    },
    {
        "header": "Suitable for Biocontrol Agent",
        "key": "suitable_for_agent_display",
        "annotation": agg(f"{CTX_PATH}__suitable_for_biocontrol_agent"),
    },
    {
        "header": "Invasive Plant",
        "key": "invasive_plant_display",
        "annotation": F("invasive_plant__full"),
    },
    {
        "header": "Observation Type",
        "key": "observation_type_display",
        "annotation": F("observation_type"),
    },
    {
        "header": "Density",
        "key": "density_display",
        "annotation": F("density__full"),
    },
    {
        "header": "Distribution",
        "key": "distribution_display",
        "annotation": F("distribution__full"),
    },
    {
        "header": "Life Stage",
        "key": "life_stage_display",
        "annotation": F("life_stage__full"),
    },
    {
        "header": "Voucher Sample",
        "key": "voucher_sample_display",
        "annotation": Case(
            When(voucher_exists_subquery, then=Value("Yes")),
            default=Value("No"),
            output_field=CharField(),
        ),
    },
]
