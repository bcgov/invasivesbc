import uuid, random
from api.models.activity import ActivitySubtypes, ObservationType
from api.models.enums import YesNoUnknown
from api.tests.factories.plants.common import build_mock_base, build_shoreline_types

from api.tests.factories.common import build_user, build_date_str
from api.tests.factories.helpers import rand_code, rand_code_list
from api.models.codes import (
    AquaticPlantCode,
    AdjacentLandUseCode,
    PlantLifeStageCode,
    DistributionCode,
    DensityCode,
    WaterbodySubstrateCode,
    WaterbodyUseCode,
    WaterLevelManagement,
    WaterbodyFlowCode,
    WaterbodyTypeCode,
    WaterbodyFlowSeasonalCode,
)


def build_waterbody_context():
    return {
        "inflow_permanent": rand_code_list(model=WaterbodyFlowCode),
        "inflow_seasonal": rand_code_list(model=WaterbodyFlowSeasonalCode),
        "outflow_permanent": rand_code_list(model=WaterbodyFlowCode),
        "outflow_seasonal": rand_code_list(model=WaterbodyFlowCode),
        "access": str(uuid.uuid4()),
        "colour": str(uuid.uuid4()),
        "comment": str(uuid.uuid4()),
        "max_depth_m": random.randint(1, 500),
        "name_gazetted": str(uuid.uuid4()),
        "name_local": str(uuid.uuid4()),
        "secchi_depth": random.randint(1, 500) if random.random() > 0.5 else None,
        "tidal_influence": random.choice(list(YesNoUnknown)).value,
        "type": rand_code(WaterbodyTypeCode),
    }


def build_context():
    return {
        "suitable_for_biocontrol": random.choice(list(YesNoUnknown)).value,
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
        "sample_point_id": str(uuid.uuid4()),
        "density": None,
        "distribution": None,
        "invasive_plant": plant_code,
        "life_stage": None,
        "observation_type": ObservationType.Negative.value,
    }


def build_positive_observation(plant_code, include_vs: bool = False):
    base = {
        "sample_point_id": None,
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
        plant_code.add(rand_code(model=AquaticPlantCode))

    return [
        build_positive_observation(plant_code.pop()),
        build_negative_observation(plant_code.pop()),
        build_positive_observation(plant_code.pop(), include_vs=True),
    ]


def build_subtype_date():
    return {
        "adjacent_land_use": rand_code_list(model=AdjacentLandUseCode),
        "substrate_type": rand_code_list(model=WaterbodySubstrateCode),
        "water_use": rand_code_list(model=WaterbodyUseCode),
        "waterlevel_management": rand_code_list(model=WaterLevelManagement),
        "shoreline_types": build_shoreline_types(),
        "waterbody_context": build_waterbody_context(),
        "entries": build_entries(),
        "context": build_context(),
        "pretreatment_observation": random.choice(list(YesNoUnknown)).value,
    }


def build_observation_plant_aquatic(
    subject, subtype: ActivitySubtypes, form_id: uuid = uuid.uuid4()
):
    return {
        **build_mock_base(subject, subtype, form_id),
        "subtype_data": build_subtype_date(),
    }
