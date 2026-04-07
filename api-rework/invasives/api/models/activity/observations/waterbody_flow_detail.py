from django.db import models
from api.models.codes.code_tables import WaterbodyFlowCode, WaterbodyFlowSeasonalCode
from api.models.activity import RepeatedFormData


class BaseWaterbodyFlow(RepeatedFormData):
    flow_code = models.ForeignKey(WaterbodyFlowCode, on_delete=models.PROTECT)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "flow_code"],
                name="unique_activity_waterlevel_management",
            )
        ]
        abstract = True


class WaterbodyOutflowSeasonal(BaseWaterbodyFlow):
    class Meta:
        db_table = '"activity"."water_outflow_s"'
        pass


class WaterbodyOutflowPermanent(BaseWaterbodyFlow):
    class Meta:
        db_table = '"activity"."water_outflow_p"'
        pass


class WaterbodyInflowSeasonal(BaseWaterbodyFlow):
    flow_code = models.ForeignKey(WaterbodyFlowSeasonalCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."water_inflow_s"'
        pass


class WaterbodyInflowPermanent(BaseWaterbodyFlow):
    class Meta:
        db_table = '"activity"."water_inflow_p"'
        pass
