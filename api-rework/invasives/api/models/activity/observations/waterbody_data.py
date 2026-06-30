from django.db import models

from api.models.codes import WaterbodyTypeCode
from api.models.enums.yes_no_unknown import YesNoUnknown
from api.models.activity import UnrepeatedFormData, DraftUnrepeatedFormData


class BaseModel(models.Model):
    type = models.ForeignKey(WaterbodyTypeCode, on_delete=models.PROTECT)
    name_gazetted = models.CharField(max_length=256, null=True, blank=True)
    name_local = models.CharField(max_length=256, null=True, blank=True)
    access = models.CharField(max_length=256, null=True, blank=True)
    max_depth_m = models.PositiveSmallIntegerField(null=True, blank=True)
    secchi_depth = models.PositiveSmallIntegerField(null=True, blank=True)
    colour = models.CharField(max_length=64, null=True, blank=True)
    tidal_influence = models.CharField(choices=YesNoUnknown)
    comment = models.TextField(max_length=16384, null=True, blank=True)

    class Meta:
        abstract = True


class WaterbodyContext(BaseModel, UnrepeatedFormData):
    class Meta:
        db_table = '"activity"."waterbody_context"'


class DraftWaterbodyContext(BaseModel, DraftUnrepeatedFormData):
    type = models.ForeignKey(
        WaterbodyTypeCode,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    tidal_influence = models.CharField(
        choices=YesNoUnknown,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = '"draft_activity"."waterbody_context"'
