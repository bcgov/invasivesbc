import random

from api.tests.factories.helpers import rand_code
from api.models.codes import ShorelineTypeCode


def build_shoreline_types(min: int = 1, max: int = 4):
    num_entries = random.randint(min, max)

    codes = set()
    while len(codes) < num_entries:
        codes.add(rand_code(ShorelineTypeCode))
    cuts = sorted(random.sample(range(1, 100), num_entries - 1))
    bounds = [0, *cuts, 100]
    percents = [hi - lo for lo, hi in zip(bounds, bounds[1:])]

    return [
        {"shoreline_type": code, "percent_covered": percent}
        for code, percent in zip(codes, percents)
    ]
