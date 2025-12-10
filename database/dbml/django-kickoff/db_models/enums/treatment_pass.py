from django.db import models

class TreatmentPass(models.TextChoices):
  First = "First", "First"
  Second = "Second", "Second"
  Third = "Third", "Third"
  Greater = "Greater", "Greater"
  Unknown = "Unknown", "Unknown"
