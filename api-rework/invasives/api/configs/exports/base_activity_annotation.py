from django.db.models import F, Value, CharField, Case, When, Exists, OuterRef, Q, Func
from django.contrib.postgres.aggregates import StringAgg
from django.db.models.functions import Concat, Cast
from api.models.activity import (
    UploadedImage,
)

SRC = "root_activity"
ADR_PATH = f"{SRC}__activitydatarecord"


def get_BASE_ANNOTATION_CONFIGURATION_LEADING(is_chemical_treatment: bool):
    return [
        {
            "header": "ID",
            "key": "short_id_display",
            "annotation": F(f"{SRC}__short_id"),
        },
        {
            "header": "Project Codes",
            "key": "project_code_display",
            "annotation": StringAgg(
                f"{ADR_PATH}__projectcode__description", delimiter=", ", distinct=True
            ),
        },
        {"header": "Date", "key": "date_display", "annotation": F(f"{SRC}__date")},
        {
            "header": "Area (m)",
            "key": "area_display",
            "annotation": F(f"{SRC}__area_m"),
        },
        {
            "header": "Latitude",
            "key": "latitude_display",
            "annotation": F(f"{SRC}__latitude"),
        },
        {
            "header": "Longitude",
            "key": "longitude_display",
            "annotation": F(f"{SRC}__longitude"),
        },
        {
            "header": "UTM Zone",
            "key": "utm_zone_display",
            "annotation": F(f"{SRC}__utm_zone"),
        },
        {
            "header": "UTM Northing",
            "key": "utm_northing_display",
            "annotation": F(f"{SRC}__utm_northing"),
        },
        {
            "header": "UTM Easting",
            "key": "utm_easting_display",
            "annotation": F(f"{SRC}__utm_easting"),
        },
        {
            "header": "Employer(s)",
            "key": "employer_display",
            "annotation": StringAgg(
                f"{ADR_PATH}__employer__employer__full", delimiter=", ", distinct=True
            ),
        },
        {
            "header": "Funding Agencies",
            "key": "funding_agency_display",
            "annotation": StringAgg(
                f"{ADR_PATH}__fundingagency__agency__full",
                delimiter=", ",
                distinct=True,
            ),
        },
        {
            "header": "Jurisdiction(s)",
            "key": "jurisdiction_display",
            # Chemical Treatments Display one jurisdiction per row for its union, so display differently.
            "annotation": (
                Concat(
                    f"jurisdiction__full",
                    Value(" ("),
                    Cast(f"jurisdiction_percent", CharField()),
                    Value("%)"),
                )
                if is_chemical_treatment
                else StringAgg(
                    Concat(
                        f"{ADR_PATH}__jurisdiction__jurisdiction__full",
                        Value(" ("),
                        Cast(f"{ADR_PATH}__jurisdiction__percent_covered", CharField()),
                        Value("%)"),
                    ),
                    delimiter=", ",
                    distinct=True,
                    # Excludes any row where the jurisdiction name is missing from the calculation
                    filter=Q(
                        **{
                            f"{ADR_PATH}__jurisdiction__jurisdiction__full__isnull": False
                        }
                    ),
                )
            ),
        },
        {
            "header": "Location Description",
            "key": "location_description_display",
            "annotation": F(f"{SRC}__location_description"),
        },
        {
            "header": "Access Description",
            "key": "access_description_display",
            "annotation": F(f"{SRC}__access_description"),
        },
        {
            "header": "Comment",
            "key": "comment_display",
            "annotation": F(f"{SRC}__comment"),
        },
        {
            "header": "Participants",
            "key": "participants_display",
            "annotation": StringAgg(
                Case(
                    When(
                        Q(**{f"{ADR_PATH}__participant__pac_number__isnull": False})
                        & ~Q(**{f"{ADR_PATH}__participant__pac_number": "None"}),
                        then=Concat(
                            f"{ADR_PATH}__participant__name",
                            Value(" (PAC: "),
                            f"{ADR_PATH}__participant__pac_number",
                            Value(")"),
                        ),
                    ),
                    default=F(f"{ADR_PATH}__participant__name"),
                    output_field=CharField(),
                ),
                delimiter=", ",
                distinct=True,
                # Only aggregate rows where a name actually exists
                filter=Q(**{f"{ADR_PATH}__participant__name__isnull": False}),
            ),
        },
    ]


photo_exists_subquery = Exists(
    UploadedImage.objects.filter(
        activity_data_record__activity_id=OuterRef(f"{SRC}__id")
    )
)

BASE_ANNOTATION_CONFIGURATION_TRAILING = [
    {
        "header": "BEC Zone(s)",
        "key": "biogeoclimatic_zones",
        "annotation": F(f"{SRC}__computed_biogeoclimatic_zone"),
    },
    {
        "header": "RISO Area(s)",
        "key": "riso_areas",
        "annotation": StringAgg(
            f"{ADR_PATH}__risoarea__organization", delimiter=", ", distinct=True
        ),
    },
    {
        "header": "IPMA Area(s)",
        "key": "ipma_areas",
        "annotation": F(f"{SRC}__computed_invasive_plant_management_areas"),
    },
    {
        "header": "Ownership",
        "key": "ownership",
        "annotation": F(f"{SRC}__computed_ownership"),
    },
    {
        "header": "Regional District(s)",
        "key": "regional_districts",
        "annotation": F(f"{SRC}__computed_regional_districts"),
    },
    {
        "header": "FLRNO District(s)",
        "key": "flrno",
        "annotation": F(f"{SRC}__computed_flrno_districts"),
    },
    {
        "header": "MOTI District(s)",
        "key": "moti",
        "annotation": F(f"{SRC}__computed_moti_districts"),
    },
    {
        "header": "Elevation",
        "key": "elevation",
        "annotation": F(f"{SRC}__computed_elevation_m"),
    },
    {
        "header": "Photo",
        "key": "photo",
        "annotation": Case(
            When(photo_exists_subquery, then=Value("Yes")),
            default=Value("No"),
            output_field=CharField(),
        ),
    },
    {
        "header": "Creation Date (UTC)",
        "key": "creation_date",
        "annotation": Func(
            f"{SRC}__created_timestamp",
            Value("YYYY-MM-DD HH24:MI"),
            function="to_char",
            output_field=CharField(),
        ),
    },
    {
        "header": "geography",
        "key": "geography",
        "annotation": F(f"{SRC}__shape"),
    },
]


def build_csv_annotation_object(
    subtype_annotations, is_chemical_treatment: bool = False
):
    return (
        get_BASE_ANNOTATION_CONFIGURATION_LEADING(
            is_chemical_treatment=is_chemical_treatment
        )
        + subtype_annotations
        + BASE_ANNOTATION_CONFIGURATION_TRAILING
    )
