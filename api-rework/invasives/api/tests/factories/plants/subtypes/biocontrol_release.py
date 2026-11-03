import uuid, random
from api.models.activity import ActivitySubtypes, ObservationType
from api.models.enums import YesNoUnknown, YesNo
from api.tests.factories.plants.common import (
    build_mock_base,
    build_weather_conditions,
    build_target_plant_phenology,
    build_microsite_conditions,
    build_agent_count_simple,
)

from api.tests.factories.common import build_user, build_date_str
from api.tests.factories.helpers import rand_code, rand_code_list
from api.models.enums import YesNo
from api.models.codes import (
    BiocontrolAgentCode,
    PlantsWithBiocontrol,
    PlantLifeStageCode,
    DistributionCode,
    DensityCode,
    AspectCode,
    SlopePercentCode,
    SoilTextureCode,
    SpecificUseCode,
)


def build_entries():
    plants = rand_code_list(model=PlantsWithBiocontrol)
    return [
        {
            "actual_biological_agents": build_agent_count_simple(),
            "estimated_biological_agents": build_agent_count_simple(),
            "agent_source": "source",
            "biocontrol_agent": rand_code(model=BiocontrolAgentCode),
            "collection_date": build_date_str(),
            "linear_segment": random.choice(list(YesNo)).value,
            "invasive_plant": plant,
            "mortality": random.randint(0, 10000),
            "plant_collected_from": (
                rand_code(model=PlantsWithBiocontrol) if random.random() > 0.5 else None
            ),
            "plant_collected_from_manual": str(uuid.uuid4()),
        }
        for plant in plants
    ]


def build_subtype_date():
    return {
        "entries": build_entries(),
        "weather_conditions": build_weather_conditions(),
        "target_plant_phenology": (
            build_target_plant_phenology() if random.random() > 0.5 else None
        ),
        "microsite_conditions": build_microsite_conditions(),
    }


def build_biocontrol_release(
    subject, subtype: ActivitySubtypes, form_id: uuid = uuid.uuid4()
):
    return {
        **build_mock_base(subject, subtype, form_id),
        "subtype_data": build_subtype_date(),
    }
