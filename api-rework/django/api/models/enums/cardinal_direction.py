from django.db import models

class CardinalDirection(models.TextChoices):
  N = "N", "North"
  NE = "NE", "Northeast"
  E = "E", "East"
  SE = "SE", "Southeast"
  S = "S", "South"
  SW = "SW", "Southwest"
  W = "W", "West"
  NW = "NW", "Northwest"
  NonApplicable = "NA", "Non-Applicable"
