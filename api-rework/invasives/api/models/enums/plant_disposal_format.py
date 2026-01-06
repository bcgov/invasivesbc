from django.db import models


class PlantDisposalFormat(models.TextChoices):
    Each = "plants", "Number of plants"
    Volume = "m^3", "Volume (Cubic Meters)"
    Weight = "kg", "Weight (kg)"
