from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes import (
    LiquidHerbicideCode,
    GranularHerbicideCode,
    HerbicideTypeCode,
)


## Submitted
class BaseModel(models.Model):
    name = models.ForeignKey("Herbicide", on_delete=models.PROTECT)
    type = models.ForeignKey(HerbicideTypeCode, on_delete=models.PROTECT)
    product_application_rate = models.FloatField()

    class Meta:
        abstract = True


class GranularHerbicideEntry(BaseModel, RepeatedFormData):
    name = models.ForeignKey(GranularHerbicideCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."herbicide_entry_granular"'


class LiquidHerbicideEntry(BaseModel, RepeatedFormData):
    name = models.ForeignKey(LiquidHerbicideCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."herbicide_entry_liquid"'


## Drafts
class DraftBaseModel(BaseModel):
    name = models.ForeignKey(
        "Herbicide", null=True, blank=True, on_delete=models.PROTECT
    )
    type = models.ForeignKey(
        HerbicideTypeCode, null=True, blank=True, on_delete=models.PROTECT
    )
    product_application_rate = models.FloatField(null=True, blank=True)

    class Meta:
        abstract = True


class DraftGranularHerbicideEntry(DraftBaseModel, DraftRepeatedFormData):
    name = models.ForeignKey(
        GranularHerbicideCode, null=True, blank=True, on_delete=models.PROTECT
    )

    class Meta:
        db_table = '"draft_activity"."herbicide_entry_granular"'


class DraftLiquidHerbicideEntry(DraftBaseModel, DraftRepeatedFormData):
    name = models.ForeignKey(
        LiquidHerbicideCode, null=True, blank=True, on_delete=models.PROTECT
    )

    class Meta:
        db_table = '"draft_activity"."herbicide_entry_liquid"'
