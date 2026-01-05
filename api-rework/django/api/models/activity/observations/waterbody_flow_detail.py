from django.db import models
from api.models.codes import WaterbodyFlowCode, WaterbodyFlowSeasonalCode
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable

class BaseWaterbodyFlow(BaseOneToManyActivityTable):
  flow_code = models.ForeignKey(WaterbodyFlowCode, on_delete=models.PROTECT)

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=["activity_id", "flow_code"], name="unique_activity_waterlevel_management")
    ]
    abstract=True


class WaterbodyOutflowSeasonal(BaseWaterbodyFlow):
  class Meta:
    #db_table='"activity"."waterbody_outflow_seasonal"'
    pass

class WaterbodyOutflowPermanent(BaseWaterbodyFlow):
  class Meta:
    #db_table='"activity"."waterbody_outflow_permanent"'
    pass

class WaterbodyInflowSeasonal(BaseWaterbodyFlow):
  flow_code = models.ForeignKey(WaterbodyFlowSeasonalCode, on_delete=models.PROTECT)
  class Meta:
    #db_table='"activity"."waterbody_inflow_seasonal"'
    pass


class WaterbodyInflowPermanent(BaseWaterbodyFlow):
  class Meta:
    #db_table='"activity"."waterbody_inflow_permanent"'
    pass
