from django.db import models

class PlatformSource(models.TextChoices):
  Ios = "Ios", "Ios"
  Android = "Android", "Android"
  Batch = "Batch", "Batch"
  Unknown = "Unknown", "Unknown"
