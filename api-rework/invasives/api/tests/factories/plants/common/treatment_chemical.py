import uuid, random
from django.db.models import Model
from api.tests.factories.helpers import rand_code
from api.tests.factories.common import build_date_time_str
from api.models.enums import YesNoUnknown
from api.models.codes import (
    ChemicalApplicationMethodDirectCode,
    ChemicalApplicationMethodSprayCode,
    LiquidHerbicideCode,
    GranularHerbicideCode,
    ServiceLicenseNumberAndCompany,
    PestManagementPlan,
    WindDirectionCode,
    ChemicalPrecautionaryStatement,
)


def build_well_entries():
    return [
        {
            "well_tag": str(random.randint(1, 100000)),
            "distance": str(random.randint(0, 1000)),
        }
        for _ in range(3)
    ]


def build_plants_treated(model: type[Model], min: int = 1, max: int = 4):
    num_entries = random.randint(min, max)
    codes = set()

    while len(codes) < num_entries:
        codes.add(rand_code(model))
    cuts = sorted(random.sample(range(1, 100), num_entries - 1))
    bounds = [0, *cuts, 100]
    percents = [hi - lo for lo, hi in zip(bounds, bounds[1:])]

    return [
        {"invasive_plant": code, "percent_covered": percent}
        for code, percent in zip(codes, percents)
    ]


def build_treatment_context_tank_mix_on(plant_code_model: type[Model]):
    return {
        "tank_mix": True,
        "application_method": rand_code(model=ChemicalApplicationMethodSprayCode),
        "calculation_type": "PAR",
        "herbicide": [
            {
                "type": "G",
                "name": rand_code(model=GranularHerbicideCode),
                "application_rate": random.randint(10, 25),
            },
            {
                "type": "L",
                "name": rand_code(model=LiquidHerbicideCode),
                "application_rate": random.randint(10, 25),
            },
        ],
        "plants_treated": build_plants_treated(model=plant_code_model),
        "amount_mix_used_l": random.randint(1, 15),
        "delivery_rate": random.randint(25, 45),
    }


def build_treatment_context_tank_mix_off(plant_code_model: type[Model]):
    return {
        "tank_mix": False,
        "application_method": rand_code(model=ChemicalApplicationMethodDirectCode),
        "calculation_type": "D",
        "herbicide": [{"type": "L", "name": rand_code(model=LiquidHerbicideCode)}],
        "plants_treated": [
            {
                "invasive_plant": rand_code(model=plant_code_model),
                "percent_covered": 100,
            }
        ],
        "amount_mix_used_l": random.randint(1, 15),
        "dilution_percent": random.randint(1, 100),
        "area_treated_sqm": random.randint(1, 1000),
    }


def build_chemical_record_context():
    reduction = random.random() > 0.5
    pmp = random.random() > 0.5
    return {
        "pesticide_employer_code": rand_code(model=ServiceLicenseNumberAndCompany),
        "pesticide_use_permit": str(uuid.uuid4()),
        "pest_management_plan": (rand_code(model=PestManagementPlan) if pmp else None),
        "pest_management_plan_manual": None if pmp else str(uuid.uuid4()),
        "temperature_c": random.randint(3, 33),
        "wind_speed_kmh": random.randint(3, 33),
        "application_start_time": build_date_time_str(),
        "wind_direction": rand_code(model=WindDirectionCode),
        "humidity": random.randint(0, 100),
        "treatment_notice_signs": random.choice(list(YesNoUnknown)).value,
        "precautionary_statement": rand_code(model=ChemicalPrecautionaryStatement),
        "ntz_reduction": reduction,
        "rationale_for_ntz_reduction": str(uuid.uuid4()) if reduction else None,
        "additional_unmapped_well_water": random.random() > 0.5,
        "pest_injury_threshold_determination": random.random() > 0.5,
    }
