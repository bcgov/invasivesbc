from django.db import models
from invasivesbc.db_models.codes import SubstrateCode
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToManyActivityTable

class WaterbodySubstrateLevel(BaseOneToManyActivityTable):
  substrate_level = models.ForeignKey(SubstrateCode, on_delete=models.PROTECT)

  class Meta:
    # db_table='"activity"."waterbody_substrate_level"'
    constraints = [
      models.UniqueConstraint(fields=["activity_id", "substrate_level"], name="unique_activity_waterbody_substrate_level")
    ]
