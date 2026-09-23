from django.db import models


class InviteStatus(models.TextChoices):
    Pending = "Pending", "Pending"
    Accepted = "Accepted", "Accepted"
    Declined = "Declined", "Declined"
    Cancelled = "Cancelled", "Cancelled"
