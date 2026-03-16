from django.db import models

from api.models.codes import WaterbodyTypeCode
from api.models.enums.yes_no_unknown import YesNoUnknown
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable


class WaterbodyContext(BaseOneToOneActivityTable):
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
        db_table = '"activity"."waterbody_context"'
