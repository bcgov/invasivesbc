from django.db.models import F, Value, CharField, Min, Func
from django.db.models.functions import Cast
from .helpers import agg

ROOT = f"root_activity__activitydatarecord"
CTX = f"{ROOT}__chemicaltreatmentcontext"


TREATMENT_CHEMICAL_ANNOTATIONS = [
    {
        "header": "Nearest Well Proximity (m)",
        "key": "well_proximity_display",
        "annotation": Min(f"{ROOT}__wellentry__distance"),
    },
    # {
    #     "header": "Service License",
    #     "key": "service_license_display",
    #     "annotation": agg(f"{CTX}__pesticide_employer_code__full"),
    # },
    {
        "header": "Pesticide Use Permit",
        "key": "pesticide_use_permit_display",
        "annotation": agg(f"{CTX}__pesticide_use_permit"),
    },
    {
        "header": "Pest Management Plan",
        "key": "pest_management_plan_display",
        "annotation": agg(f"{CTX}__pest_management_plan__full"),
    },
    # {
    #     "header": "Pest Management Plan (Manual Entry)",
    #     "key": "pmp_not_in_dropdown_display",
    #     "annotation": F(f"pmp_not_in_dropdown"),
    # },
    {
        "header": "Temperature (C)",
        "key": "temperature_celsius_display",
        "annotation": agg(Cast(f"{CTX}__temperature_c", CharField())),
    },
    {
        "header": "Wind Speed (km/h)",
        "key": "wind_speed_km_display",
        "annotation": agg(Cast(f"{CTX}__wind_speed_kmh", CharField())),
    },
    {
        "header": "Wind Direction",
        "key": "wind_direction_display",
        "annotation": agg(f"{CTX}__wind_direction__full"),
    },
    {
        "header": "Humidity (%)",
        "key": "humidity_percent_display",
        "annotation": agg(Cast(f"{CTX}__humidity", CharField())),
    },
    {
        "header": "Treatment Notice Signs Left",
        "key": "treatment_notice_signs_display",
        "annotation": agg(f"{CTX}__treatment_notice_signs"),
    },
    {
        "header": "Application Start Time",
        "key": "application_start_time_display",
        "annotation": Func(
            Min(f"{CTX}__application_start_time"),
            Value("YYYY-MM-DD HH24:MI"),
            function="to_char",
            output_field=CharField(),
        ),
    },
    {
        "header": "Invasive Plant",
        "key": "invasive_plant_display",
        "annotation": F(f"invasive_plant__full"),
    },
    {
        "header": "Invasive Plant Percent Covered",
        "key": "invasive_plant_percent_display",
        "annotation": F(f"percent_area_covered"),
    },
    # {"header": "Tank Mix Used", "key": "tank_mix_display", "annotation": F(f"tank_mix")},
    # {
    #     "header": "Chemical Application Method",
    #     "key": "chemical_application_method_display",
    #     "annotation": F(f"chemical_application_method"),
    # },
    # {
    #     "header": "Herbicide Type",
    #     "key": "herbicide_type_display",
    #     "annotation": F(f"herbicide_type"),
    # },
    # {"header": "Herbicide", "key": "herbicide_display", "annotation": F(f"herbicide")},
    # {
    #     "header": "Calculation Type",
    #     "key": "calculation_type_display",
    #     "annotation": F(f"calculation_type"),
    # },
    # {
    #     "header": "Delivery Rate of Mix",
    #     "key": "delivery_rate_of_mix_display",
    #     "annotation": F(f"delivery_rate_of_mix"),
    # },
    # {
    #     "header": "Product Application Rate",
    #     "key": "product_application_rate_display",
    #     "annotation": F(f"product_application_rate"),
    # },
    # {"header": "Dilution", "key": "dilution_display", "annotation": F(f"dilution")},
    # {
    #     "header": "Amount of Undiluted Herbicide Used",
    #     "key": "amount_of_undiluted_herbicide_used_liters_display",
    #     "annotation": F(f"amount_of_undiluted_herbicide_used_liters"),
    # },
    # {
    #     "header": "Area_Treated (sqm)",
    #     "key": "area_treated_sqm_display",
    #     "annotation": F(f"area_treated_sqm"),
    # },
    # {
    #     "header": "Amount of Mix Used (L)",
    #     "key": "amount_of_mix_used_display",
    #     "annotation": F(f"amount_of_mix_used"),
    # },
    # {
    #     "header": "Percent Area Covered",
    #     "key": "percent_area_covered_display",
    #     "annotation": F(f"percent_area_covered"),
    # },
]
