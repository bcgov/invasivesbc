from django.db import models


class ActivityType(models.TextChoices):
    Observation = "Observation", "Observation"
    Treatment = "Treatment", "Treatment"
    Monitoring = "Monitoring", "Monitoring"
    Biocontrol = "Biocontrol", "Biocontrol"
