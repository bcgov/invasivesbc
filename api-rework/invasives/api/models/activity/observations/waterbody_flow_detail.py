from django.db import models
from api.models.codes.code_tables import WaterbodyFlowCode, WaterbodyFlowSeasonalCode
from api.models.activity import RepeatedFormData, DraftRepeatedFormData


class WaterbodyFlowMixin(models.Model):
    flow_code = models.ForeignKey(WaterbodyFlowCode, on_delete=models.PROTECT)

    class Meta:
        abstract = True


class BaseWaterbodyFlow(WaterbodyFlowMixin, RepeatedFormData):

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


class WaterbodyOutflowPermanent(BaseWaterbodyFlow):
    class Meta:
        db_table = '"activity"."water_outflow_p"'


class WaterbodyInflowSeasonal(BaseWaterbodyFlow):
    flow_code = models.ForeignKey(WaterbodyFlowSeasonalCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."water_inflow_s"'


class WaterbodyInflowPermanent(BaseWaterbodyFlow):
    class Meta:
        db_table = '"activity"."water_inflow_p"'


class DraftWaterbodyOutflowSeasonal(WaterbodyFlowMixin, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."water_outflow_s"'


class DraftWaterbodyOutflowPermanent(WaterbodyFlowMixin, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."water_outflow_p"'


class DraftWaterbodyInflowSeasonal(WaterbodyFlowMixin, DraftRepeatedFormData):
    flow_code = models.ForeignKey(WaterbodyFlowSeasonalCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"draft_activity"."water_inflow_s"'


class DraftWaterbodyInflowPermanent(WaterbodyFlowMixin, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."water_inflow_p"'
