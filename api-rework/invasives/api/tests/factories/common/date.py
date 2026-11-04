import random
from datetime import datetime


def build_date() -> datetime:
    year = random.randrange(2024, 2025)
    month = random.randrange(1, 11)
    day = random.randrange(1, 28)
    return datetime(year, month, day)


def build_date_str() -> str:
    return build_date().strftime("%Y-%m-%d")


def build_date_time_str() -> str:
    return str(build_date())
