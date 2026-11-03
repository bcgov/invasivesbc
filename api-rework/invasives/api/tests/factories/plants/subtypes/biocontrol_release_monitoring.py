import uuid, random
from api.models.activity import ActivitySubtypes
from api.tests.factories.plants.common import (
    build_mock_base,
    build_weather_conditions,
    build_target_plant_phenology,
    build_microsite_conditions,
    build_agent_count_complex,
)

from api.tests.factories.common import build_date_str
from api.tests.factories.helpers import rand_code, rand_code_list
from api.models.enums import CollectionType, YesNoUnknown
from api.models.codes import (
    BiocontrolAgentCode,
    PlantsWithBiocontrol,
    BioAgentMonitoringMethodCode,
    BiocontrolPresenceCode,
    AgentLocationFoundTerrainCode,
)


def build_entries():
    plants = rand_code_list(model=PlantsWithBiocontrol)
    timestamp = build_date_str()
    m_type = random.choice(list(CollectionType)).value
    is_timed = m_type == CollectionType.Timed.value
    monitoring_method = rand_code(model=BioAgentMonitoringMethodCode)
    biocontrol_present = random.random() > 0.5
    return [
        {
            "historical_iapp_site": (
                random.randint(1, 9999) if random.random() > 0.5 else None
            ),
            "biocontrol_agent": rand_code(model=BiocontrolAgentCode),
            "biocontrol_present": biocontrol_present,
            "invasive_plant": plant,
            "monitoring_type": m_type,
            "monitoring_method": monitoring_method,
            "count_duration_minutes": random.randint(1, 30) if is_timed else None,
            "plant_count": None if is_timed else random.randint(1, 30),
            "location_agent_found": (
                rand_code_list(model=AgentLocationFoundTerrainCode)
                if random.random() > 0.5
                else []
            ),
            "sign_of_biocontrol_presence": rand_code_list(model=BiocontrolPresenceCode),
            "start_time": timestamp,
            "stop_time": timestamp,
            "suitable_for_collection": random.choice(list(YesNoUnknown)).value,
            "actual_biological_agents": build_agent_count_complex(),
            "estimated_biological_agents": build_agent_count_complex(),
        }
        for plant in plants
    ]


def build_spread_results():
    return {
        "agent_density": random.randint(0, 100),
        "plant_attack": random.randint(0, 100),
        "max_spread_distance_m": random.randint(0, 100),
        "max_spread_aspect_deg": random.randint(0, 360),
    }


def build_subtype_date():
    return {
        "entries": build_entries(),
        "weather_conditions": build_weather_conditions(),
        "target_plant_phenology": (
            build_target_plant_phenology() if random.random() > 0.5 else None
        ),
        "microsite_conditions": build_microsite_conditions(),
        "spread_results": build_spread_results() if random.random() > 0.5 else None,
    }


def build_biocontrol_release_monitoring(
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
