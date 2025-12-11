from django.db import models
from invasivesbc.db_models.enums import YesNoUnknown
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToOneActivityTable

class WaterbodyData(BaseOneToOneActivityTable):
  type = models.CharField(max_length=64)
  name_gazetted = models.CharField(max_length=256)
  name_local = models.CharField(max_length=256)
  access = models.CharField(max_length=64)
  max_depth_m = models.PositiveSmallIntegerField()
  secchi_depth = models.PositiveSmallIntegerField()
  colour = models.CharField(max_length=64)
  tidal_influence = models.CharField(choices=YesNoUnknown)
  comment = models.TextField(max_length=512)

  class Meta:
    # db_table='"activity"."waterbody_data"'
    pass
