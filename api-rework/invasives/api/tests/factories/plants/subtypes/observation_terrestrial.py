import uuid, random
from api.models.activity import ActivitySubtypes, ObservationType
from api.models.enums import YesNoUnknown, YesNo
from api.tests.factories.plants.common import build_mock_base

from api.tests.factories.common import build_user, build_date_str
from api.tests.factories.helpers import rand_code, rand_code_list
from api.models.codes import (
    TerrestrialPlantCode,
    PlantLifeStageCode,
    DistributionCode,
    DensityCode,
    AspectCode,
    SlopePercentCode,
    SoilTextureCode,
    SpecificUseCode,
)


def build_context():
    return {
        "research_observation": random.choice(list(YesNo)).value,
        "visible_well_nearby": random.choice(list(YesNoUnknown)).value,
        "aspect": rand_code(AspectCode),
        "slope_percent": rand_code(SlopePercentCode),
        "soil_texture": rand_code(SoilTextureCode),
        "specific_uses": rand_code_list(model=SpecificUseCode, key="specific_use"),
        "suitable_for_biocontrol_agent": random.choice(list(YesNoUnknown)).value,
    }


def build_voucher_specimen():
    date_str = build_date_str()
    return {
        "voucher_sample_id": str(random.randint(1, 99999)),
        "herbarium": build_user(),
        "accession_number": str(random.randint(1, 99999)),
        "date_collected": date_str,
        "date_verified": date_str,
        "completed_by_person": build_user(),
        "completed_by_org": build_user(),
        "utm_zone": random.randint(10, 16),
        "utm_easting": random.randint(10000, 20000),
        "utm_northing": random.randint(60000, 70000),
    }


def build_negative_observation(plant_code):
    return {
        "density": None,
        "distribution": None,
        "invasive_plant": plant_code,
        "life_stage": None,
        "observation_type": ObservationType.Negative.value,
    }


def build_positive_observation(plant_code, include_vs: bool = False):
    base = {
        "density": rand_code(DensityCode),
        "distribution": rand_code(DistributionCode),
        "invasive_plant": plant_code,
        "life_stage": rand_code(PlantLifeStageCode),
        "observation_type": ObservationType.Positive.value,
    }
    if include_vs:
        base["voucher_specimen"] = build_voucher_specimen()
    return base


def build_entries():
    plant_code = set()
    while len(plant_code) < 3:
        plant_code.add(rand_code(model=TerrestrialPlantCode))

    return [
        build_positive_observation(plant_code.pop()),
        build_negative_observation(plant_code.pop()),
        build_positive_observation(plant_code.pop(), include_vs=True),
    ]


def build_subtype_date():
    return {
        "entries": build_entries(),
        "context": build_context(),
        "pretreatment_observation": random.choice(list(YesNoUnknown)).value,
    }


def build_observation_plant_terrestrial(
    subject,
    subtype: ActivitySubtypes,
    form_id: uuid = uuid.uuid4(),
):
    return {
        **build_mock_base(subject, subtype, form_id),
        "subtype_data": build_subtype_date(),
    }
