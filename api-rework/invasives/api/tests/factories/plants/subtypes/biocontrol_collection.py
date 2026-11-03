import uuid, random
from api.models.activity import ActivitySubtypes
from api.tests.factories.plants.common import (
    build_mock_base,
    build_weather_conditions,
    build_target_plant_phenology,
    build_microsite_conditions,
    build_agent_count_simple,
)

from api.tests.factories.common import build_date_str
from api.tests.factories.helpers import rand_code, rand_code_list
from api.models.enums import CollectionType
from api.models.codes import (
    BiocontrolAgentCode,
    PlantsWithBiocontrol,
    BioAgentCollectionMethodCode,
)


def build_entries():
    plants = rand_code_list(model=PlantsWithBiocontrol)
    timestamp = build_date_str()
    c_type = random.choice(list(CollectionType)).value
    is_timed = c_type == CollectionType.Timed.value
    collection_method = rand_code(model=BioAgentCollectionMethodCode)
    is_sweep = collection_method == "Cs"
    return [
        {
            "invasive_plant": plant,
            "biocontrol_agent": rand_code(model=BiocontrolAgentCode),
            "collection_type": c_type,
            "time_collection_duration_minutes": (
                random.randint(1, 30) if is_timed else None
            ),
            "plant_count_collection": None if is_timed else random.randint(1, 30),
            "collection_method": collection_method,
            "number_of_sweeps": random.randint(1, 30) if is_sweep else None,
            "start_time_collecting": timestamp,
            "end_time_collecting": timestamp,
            "comment": str(uuid.uuid4()),
            "actual_biological_agents": build_agent_count_simple(),
            "estimated_biological_agents": build_agent_count_simple(),
            "historical_iapp_site": (
                random.randint(1, 55555) if random.random() > 0.5 else None
            ),
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


def build_biocontrol_collection(
    subject, subtype: ActivitySubtypes, linking_activities, form_id: uuid = uuid.uuid4()
):
    return {
        **build_mock_base(
            subject=subject,
            subtype=subtype,
            linking_activities=linking_activities,
            form_id=form_id,
        ),
        "subtype_data": build_subtype_date(),
    }
