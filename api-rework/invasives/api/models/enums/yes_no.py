from django.db import models


class YesNo(models.TextChoices):
    Yes = (
        "Yre",
        "Yes",
    )
    No = "No", "No"
