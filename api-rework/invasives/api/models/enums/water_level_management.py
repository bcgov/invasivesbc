from django.db import models


class WaterLevelManagement(models.TextChoices):
    Dam = "Dam", "Dam"
    NonePresent = "None", "None"
    Other = "Other", "Other"
    Station = "Station", "Station"
    Weir = "Weir", "Weir"
