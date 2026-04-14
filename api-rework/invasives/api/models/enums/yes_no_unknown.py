from django.db import models


class YesNoUnknown(models.TextChoices):
    Yes = (
        "Yes",
        "Yes",
    )
    No = "No", "No"
    Unknown = "Unknown", "Unknown"
