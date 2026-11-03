from django.db.models import Model
import random

FLOOR = 0


def rand_code(model: type[Model], nullable: bool = False) -> str | None:
    if nullable and random.random() > 0.8:
        return None

    ceiling = model.objects.all().count()
    return model.objects.all().values_list("pk", flat=True)[
        random.randrange(FLOOR, ceiling)
    ]
