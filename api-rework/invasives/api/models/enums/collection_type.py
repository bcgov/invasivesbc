from django.db import models


class CollectionType(models.TextChoices):
    Timed = (
        "Timed",
        "Timed",
    )
    Count = "Count", "Count"
