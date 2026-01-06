from django.db import models


class FormStatus(models.TextChoices):
    Draft = "Draft", "Draft"
    Submitted = "Submitted", "Submitted"
    Flagged = "Flagged", "Flagged"
    Deleted = "Deleted", "Deleted"
