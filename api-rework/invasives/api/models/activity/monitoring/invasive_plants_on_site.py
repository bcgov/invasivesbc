from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes import InvasivePlantsOnSiteCode


class BaseModel(models.Model):
    invasive_plants_on_site = models.ForeignKey(
        InvasivePlantsOnSiteCode, on_delete=models.PROTECT
    )

    class Meta:
        abstract = True


class InvasivePlantsOnSite(BaseModel, RepeatedFormData):
    class Meta:
        db_table = '"activity"."invasive_plants_on_site"'


class DraftInvasivePlantsOnSite(BaseModel, DraftRepeatedFormData):

    invasive_plants_on_site = models.ForeignKey(
        InvasivePlantsOnSiteCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"draft_activity"."invasive_plants_on_site"'
