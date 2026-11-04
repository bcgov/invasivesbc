import random, uuid
from django.db.models import Model
from api.tests.factories.helpers import rand_code, rand_code_list
from api.models.enums import TreatmentPass, YesNo
from api.models.codes import (
    TerrestrialPlantCode,
    AquaticPlantCode,
    InvasivePlantsOnSiteCode,
    EfficacyManagementRatingCode,
    TreatmentEfficacyRatingCode,
)


def roll_for_code(model: type[Model], spent_list: set):
    code = rand_code(model=model)
    while code in spent_list:
        code = rand_code(model=model)
    spent_list.add(code)
    return code


def build_monitoring_treatment_entries(min: int = 2, max: int = 5):
    entries = []
    spent_codes = set()
    total = random.randint(min, max)
    while len(entries) < total:
        entry = {
            "invasive_plant": None,
            "evidence_of_treatment": random.choice(list(YesNo)).value,
            "treatment_pass": random.choice(list(TreatmentPass)).value,
            "comment": str(uuid.uuid4()),
            "invasive_plants_on_site": rand_code_list(
                model=InvasivePlantsOnSiteCode, key="invasive_plants_on_site"
            ),
            "management_efficacy_rating": rand_code(model=EfficacyManagementRatingCode),
            "treatment_efficacy_rating": None,
            "invasive_plant_aquatic": None,
        }
        if entry["evidence_of_treatment"] == YesNo.Yes.value:
            entry["treatment_efficacy_rating"] = rand_code(
                model=TreatmentEfficacyRatingCode
            )
        # Alternate Aquatic / Terrestrial
        if len(entries) % 2 == 0:
            entry["invasive_plant_aquatic"] = roll_for_code(
                model=AquaticPlantCode, spent_list=spent_codes
            )
        else:
            entry["invasive_plant"] = roll_for_code(
                model=TerrestrialPlantCode, spent_list=spent_codes
            )
        entries.append(entry)

    return entries
