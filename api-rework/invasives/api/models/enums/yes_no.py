from django.db import models


class YesNo(models.TextChoices):
    Yes = (
        "Y",
        "Yes",
    )
    No = "N", "No"
