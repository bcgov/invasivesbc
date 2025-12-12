from django.db import models
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToManyActivityTable

class NearestWell(BaseOneToManyActivityTable):
  """
  Identifier for Registered wells in proximity of a Chemical Treatment Site.
  Distance is based on the Centroid value of the Activity shape
  """
  well_tag_number = models.PositiveIntegerField(db_comment="Identifier of a Registered Well")
  distance = models.PositiveIntegerField(db_comment="Distance from centroid of activity")

  def __str__(self):
    return f"{self.activity_id.short_id}: {self.distance}m ID: {self.well_tag_number}"
