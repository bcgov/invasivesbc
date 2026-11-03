import uuid, random
from api.tests.factories.common import build_user, build_date_str
from api.tests.factories.helpers import rand_code, rand_code_list
from api.models.codes import (
    CloudCoverCode,
    PrecipitationCode,
    WindDirectionCode,
)


def build_weather_conditions():
    return {
        "comments": str(uuid.uuid4()),
        "cloud_cover": rand_code(model=CloudCoverCode),
        "precipitation": rand_code(model=PrecipitationCode),
        "temperature": random.randint(1, 33),
        "wind_direction": rand_code(model=WindDirectionCode),
        "wind_speed_kmh": random.randint(1, 33),
    }
