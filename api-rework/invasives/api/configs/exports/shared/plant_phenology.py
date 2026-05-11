from django.db.models import Value, CharField, Case, When, Exists, OuterRef, Max
from django.db.models.functions import Cast
from api.models.activity.biocontrol.target_plant_phenology import TargetPlantPhenology
from ..helpers import agg

ROOT = f"root_activity__activitydatarecord"
TPP = f"{ROOT}__targetplantphenology"

tpp_exists_subquery = Exists(
    TargetPlantPhenology.objects.filter(activity_data_record_id=OuterRef(f"{ROOT}__id"))
)


PLANT_PHENOLOGY_ANNOTATIONS = [
    {
        "header": "phenology_details_recorded",
        "key": "phenology_details_recorded_display",
        "annotation": Max(
            Case(
                When(tpp_exists_subquery, then=Value("Yes")),
                default=Value("No"),
                output_field=CharField(),
            )
        ),
    },
    {
        "header": "Target Plant Heights",
        "key": "target_plant_heights_display",
        "annotation": agg(Cast(f"{ROOT}__targetplantheights__height_cm", CharField())),
    },
    {
        "header": "Winter Dormant",
        "key": "winter_dormant_display",
        "annotation": agg(Cast(f"{TPP}__winter_dormant", CharField())),
    },
    {
        "header": "Seedlings",
        "key": "seedlings_display",
        "annotation": agg(Cast(f"{TPP}__seedlings", CharField())),
    },
    {
        "header": "Rosettes",
        "key": "rosettes_display",
        "annotation": agg(Cast(f"{TPP}__rosettes", CharField())),
    },
    {
        "header": "Bolts",
        "key": "bolts_display",
        "annotation": agg(Cast(f"{TPP}__bolts", CharField())),
    },
    {
        "header": "Flowering",
        "key": "flowering_display",
        "annotation": agg(Cast(f"{TPP}__flowering", CharField())),
    },
    {
        "header": "Seeds Forming",
        "key": "seeds_forming_display",
        "annotation": agg(Cast(f"{TPP}__seeds_forming", CharField())),
    },
    {
        "header": "Senescent",
        "key": "senescent_display",
        "annotation": agg(Cast(f"{TPP}__senescent", CharField())),
    },
]
