from django.db import models


class BugReportStatus(models.TextChoices):
    Resolved = "Resolved", "Resolved"
    Open = "Open", "Open"
    Closed = "Closed", "Closed"
