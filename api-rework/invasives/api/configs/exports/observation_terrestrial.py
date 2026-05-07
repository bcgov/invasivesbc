from django.db.models import F, Value, CharField, Case, When, Exists, OuterRef, Q
from django.contrib.postgres.aggregates import StringAgg
from api.models.activity import (
    TerrestrialVoucherSpecimen,
)

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
        "annotation": StringAgg(
            f"{ADR_PATH}__pretreatmentobservation__pre_treatment_observation",
            delimiter=", ",
            distinct=True,
        ),
    },
    {
        "header": "Soil Texture",
        "key": "soil_texture_display",
        "annotation": StringAgg(
            f"{CTX_PATH}__soil_texture__full",
            delimiter=", ",
            distinct=True,
        ),
    },
    {
        "header": "Specific Use(s)",
        "key": "specific_use_display",
        "annotation": StringAgg(
            f"{ADR_PATH}__specificuse__specific_use__full",
            delimiter=", ",
            distinct=True,
        ),
    },
    {
        "header": "Slope Percent",
        "key": "slope_display",
        "annotation": StringAgg(
            f"{CTX_PATH}__slope_percent__full", delimiter=", ", distinct=True
        ),
    },
    {
        "header": "Aspect",
        "key": "aspect_display",
        "annotation": StringAgg(
            f"{CTX_PATH}__aspect__full", delimiter=", ", distinct=True
        ),
    },
    {
        "header": "Research Observation",
        "key": "research_observation_display",
        "annotation": StringAgg(
            f"{CTX_PATH}__research_observation", delimiter=", ", distinct=True
        ),
    },
    {
        "header": "Visible Well Nearby",
        "key": "well_nearby_display",
        "annotation": StringAgg(
            f"{CTX_PATH}__visible_well_nearby", delimiter=", ", distinct=True
        ),
    },
    {
        "header": "Suitable for Biocontrol Agent",
        "key": "suitable_for_agent_display",
        "annotation": StringAgg(
            f"{CTX_PATH}__suitable_for_biocontrol_agent", delimiter=", ", distinct=True
        ),
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
