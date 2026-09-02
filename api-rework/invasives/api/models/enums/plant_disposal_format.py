from django.db import models


class PlantDisposalFormat(models.TextChoices):
    Each = "number of plants", "Number of plants"
    Volume = "volume (m3)", "Volume (Cubic Meters)"
    Weight = "weight", "Weight (kg)"
