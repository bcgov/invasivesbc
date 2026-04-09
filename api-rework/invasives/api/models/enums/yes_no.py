from django.db import models


class YesNo(models.TextChoices):
    Yes = (
        "Yes",
        "Yes",
    )
    No = "No", "No"
