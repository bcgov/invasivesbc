from django.db import models


class YesNoUnknown(models.TextChoices):
    Yes = (
        "Y",
        "Yes",
    )
    No = "N", "No"
    Unknown = "U", "Unknown"
