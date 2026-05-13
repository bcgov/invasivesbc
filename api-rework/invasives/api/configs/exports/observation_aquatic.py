from django.db.models import F, Value, CharField, Case, When, Exists, OuterRef, Q
from django.contrib.postgres.aggregates import StringAgg
from django.db.models.functions import Concat, Cast
from api.models.activity import (
    TerrestrialVoucherSpecimen,
)
from .helpers import agg

SRC = "root_activity"
ADR_PATH = f"{SRC}__activitydatarecord"
CTX_PATH = f"{ADR_PATH}__aquaticplantobservationcontext"
WB_CTX = f"{ADR_PATH}__waterbodycontext"


voucher_exists_subquery = Exists(
    TerrestrialVoucherSpecimen.objects.filter(
        activity_data_record__activity_id=OuterRef(f"{SRC}__id")
    )
)

OBSERVATION_AQUATIC_ANNOTATIONS = [
    {
        "header": "Observation Type",
        "key": "observation_type_display",
        "annotation": F("observation_type"),
    },
    {
        "header": "Sample Point ID",
        "key": "sample_point_id_display",
        "annotation": F("sample_point_id"),
    },
    {
        "header": "Invasive Plant",
        "key": "invasive_plant_display",
        "annotation": F("invasive_plant__full"),
    },
    {
        "header": "Life Stage",
        "key": "life_stage_display",
        "annotation": F("life_stage__full"),
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
        "header": "Suitable for Biocontrol",
        "key": "suitable_for_biocontrol_display",
        "annotation": agg(
            f"{CTX_PATH}__suitable_for_biocontrol",
        ),
    },
    {
        "header": "Shorelines",
        "key": "shoreline_display",
        "annotation": StringAgg(
            Concat(
                f"{ADR_PATH}__shorelinetypes__shoreline_type__full",
                Value(" ("),
                Cast(f"{ADR_PATH}__shorelinetypes__percent_covered", CharField()),
                Value("%)"),
            ),
            delimiter=", ",
            distinct=True,
            # Excludes any row where the jurisdiction name is missing from the calculation
            filter=Q(
                **{f"{ADR_PATH}__shorelinetypes__shoreline_type__full__isnull": False}
            ),
        ),
    },
    {
        "header": "Waterbody Type",
        "key": "waterbody_type_display",
        "annotation": agg(
            f"{WB_CTX}__type__full",
        ),
    },
    {
        "header": "Name (Gazetted)",
        "key": "name_gazetted_display",
        "annotation": agg(
            f"{WB_CTX}__name_gazetted",
        ),
    },
    {
        "header": "Name (Local)",
        "key": "name_local_display",
        "annotation": agg(
            f"{WB_CTX}__name_local",
        ),
    },
    {
        "header": "Waterbody Access",
        "key": "access_display",
        "annotation": agg(
            f"{WB_CTX}__access",
        ),
    },
    {
        "header": "Water Use",
        "key": "water_use_display",
        "annotation": agg(
            f"{ADR_PATH}__waterbodyuse__waterbody_use__full",
        ),
    },
    {
        "header": "Water Level Management",
        "key": "water_level_management_display",
        "annotation": agg(
            f"{ADR_PATH}__waterbodylevelmanagement__waterlevel_management__full",
        ),
    },
    {
        "header": "Outflow (Seasonal)",
        "key": "outflow_seasonal_display",
        "annotation": agg(
            f"{ADR_PATH}__waterbodyoutflowseasonal__flow_code__full",
        ),
    },
    {
        "header": "Outflow (Permanent)",
        "key": "outflow_permanent_display",
        "annotation": agg(
            f"{ADR_PATH}__waterbodyoutflowpermanent__flow_code__full",
        ),
    },
    {
        "header": "Inflow (Seasonal)",
        "key": "inflow_seasonal_display",
        "annotation": agg(
            f"{ADR_PATH}__waterbodyinflowseasonal__flow_code__full",
        ),
    },
    {
        "header": "Inflow (Permanent)",
        "key": "inflow_permanent_display",
        "annotation": agg(
            f"{ADR_PATH}__waterbodyinflowpermanent__flow_code__full",
        ),
    },
    {
        "header": "Waterbody Comment",
        "key": "wb_comment_display",
        "annotation": agg(
            f"{WB_CTX}__comment",
        ),
    },
    {
        "header": "Sample Water Depth (m)",
        "key": "water_depth_display",
        "annotation": agg(
            Cast(f"{WB_CTX}__max_depth_m", CharField()),
        ),
    },
    {
        "header": "Secchi Depth (m)",
        "key": "secchi_depth_display",
        "annotation": agg(
            Cast(f"{WB_CTX}__secchi_depth", CharField()),
        ),
    },
    {
        "header": "Water Colour",
        "key": "water_colour_display",
        "annotation": agg(
            f"{WB_CTX}__colour",
        ),
    },
    {
        "header": "Tidal Influence",
        "key": "tidal_influece_display",
        "annotation": agg(
            f"{WB_CTX}__tidal_influence",
        ),
    },
    {
        "header": "Voucher Specimen",
        "key": "voucher_specimen_display",
        "annotation": Case(
            When(voucher_exists_subquery, then=Value("Yes")),
            default=Value("No"),
            output_field=CharField(),
        ),
    },
    {
        "header": "Pre-treatment Observation",
        "key": "pre_treatment_observation_display",
        "annotation": agg(
            f"{ADR_PATH}__pretreatmentobservation__pre_treatment_observation",
        ),
    },
    {
        "header": "Substrate Type",
        "key": "subtrate_type_display",
        "annotation": agg(
            f"{ADR_PATH}__waterbodysubstratetype__substrate_type__full",
        ),
    },
    {
        "header": "Adjacent Land Use",
        "key": "adjacent_land_use_display",
        "annotation": agg(
            f"{ADR_PATH}__waterbodyadjacentlanduse__waterbody_adjacent_land_use__full",
        ),
    },
]
