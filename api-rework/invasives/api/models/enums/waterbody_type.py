from django.db import models

class WaterbodyType(models.TextChoices):
  Bog = 'Bog', 'Bog',
  Confined_Pond = 'Confined Pond', 'Confined Pond',
  Discharging_Pond ='Discharging Pond', 'Discharging Pond',
  Ditch = 'Ditch', 'Ditch',
  Intertidal = 'Intertidal', 'Intertidal',
  Lake = 'Lake', 'Lake',
  River = 'River', 'River',
  Slough = 'Slough', 'Slough',
  Stream = 'Stream', 'Stream',
  Wetland = 'Wetland' 'Wetland'
