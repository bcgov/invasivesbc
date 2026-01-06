from django.db import models


class ObservationType(models.TextChoices):
    Positive = "Positive", "Positive Observation"
    Negative = "Negative", "Negative Observation"
