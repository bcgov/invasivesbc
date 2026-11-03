import random
from api.tests.factories.helpers import rand_code, rand_code_list
from api.models.codes import (
    AgentLocationFoundCode,
    PlantPositionCode,
    BioAgentLifeStageCode,
)


def build_agent_count_simple():
    codes = rand_code_list(model=BioAgentLifeStageCode)
    return [
        {
            "stage": code,
            "quantity": random.randint(1, 10000),
        }
        for code in codes
    ]


def build_agent_count_complex():
    codes = rand_code_list(model=BioAgentLifeStageCode)
    return [
        {
            "stage": code,
            "quantity": random.randint(1, 10000),
            "plant_position": rand_code(model=PlantPositionCode),
            "agent_location": rand_code(model=AgentLocationFoundCode),
        }
        for code in codes
    ]
