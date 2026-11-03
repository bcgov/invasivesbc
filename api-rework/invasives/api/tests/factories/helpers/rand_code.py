from django.db.models import Model
from typing import List
import random

FLOOR = 0


def rand_code(model: type[Model], nullable: bool = False) -> str | None:
    if nullable and random.random() > 0.8:
        return None

    ceiling = model.objects.all().count()
    return model.objects.all().values_list("pk", flat=True)[
        random.randrange(FLOOR, ceiling)
    ]


def rand_code_list(
    model: type[Model], key: str = None, min: int = 1, max: int = 5
) -> List[dict] | List[str]:
    if key is not None and not isinstance(key, str):
        raise TypeError(f"key must be a str, got {type(key).__name__}")
    codes: set[str] = set()
    for _ in range(random.randint(min, max)):
        codes.add(rand_code(model))
    if key:
        return [{key: code} for code in codes]
    return list(codes)
