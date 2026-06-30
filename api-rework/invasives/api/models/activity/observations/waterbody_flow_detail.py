from django.db import models
from api.models.codes.code_tables import WaterbodyFlowCode, WaterbodyFlowSeasonalCode
from api.models.activity import RepeatedFormData, DraftRepeatedFormData


class BaseModel(models.Model):
    flow_code = models.ForeignKey(WaterbodyFlowCode, on_delete=models.PROTECT)

    class Meta:
        abstract = True


class WaterbodyOutflowSeasonal(BaseModel):
    class Meta:
        db_table = '"activity"."water_outflow_s"'


class WaterbodyOutflowPermanent(BaseModel):
    class Meta:
        db_table = '"activity"."water_outflow_p"'


class WaterbodyInflowSeasonal(BaseModel):
    flow_code = models.ForeignKey(WaterbodyFlowSeasonalCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."water_inflow_s"'


class WaterbodyInflowPermanent(BaseModel):
    class Meta:
        db_table = '"activity"."water_inflow_p"'


class DraftWaterbodyOutflowSeasonal(BaseModel, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."water_outflow_s"'


class DraftWaterbodyOutflowPermanent(BaseModel, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."water_outflow_p"'


class DraftWaterbodyInflowSeasonal(BaseModel, DraftRepeatedFormData):
    flow_code = models.ForeignKey(WaterbodyFlowSeasonalCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"draft_activity"."water_inflow_s"'


class DraftWaterbodyInflowPermanent(BaseModel, DraftRepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."water_inflow_p"'
