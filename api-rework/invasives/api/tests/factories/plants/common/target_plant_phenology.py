import random


def build_plant_heights():
    return [{"height_cm": random.randint(2, 59)} for _ in range(random.randint(1, 4))]


PHENOLOGY_STAGES = [
    "winter_dormant",
    "seedlings",
    "rosettes",
    "bolts",
    "flowering",
    "seeds_forming",
    "senescent",
]


def random_percentages(n, total=100):
    """Return n random non-negative integers that sum to `total`."""
    cuts = sorted(random.sample(range(total + n - 1), n - 1))
    bounds = [-1] + cuts + [total + n - 1]
    return [bounds[i + 1] - bounds[i] - 1 for i in range(n)]


def build_target_plant_phenology():
    values = random_percentages(len(PHENOLOGY_STAGES))
    phenology = dict(zip(PHENOLOGY_STAGES, values))
    phenology["target_plant_heights"] = build_plant_heights()
    return phenology
