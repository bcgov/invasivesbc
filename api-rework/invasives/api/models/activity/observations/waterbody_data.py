from django.db import models
from api.models.enums import YesNoUnknown
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from api.models.codes import WaterbodyType


class WaterbodyData(BaseOneToOneActivityTable):
    type = models.ForeignKey(WaterbodyType, on_delete=models.PROTECT)
    name_gazetted = models.CharField(max_length=256)
    name_local = models.CharField(max_length=256)
    access = models.CharField(max_length=64)
    max_depth_m = models.PositiveSmallIntegerField()
    secchi_depth = models.PositiveSmallIntegerField()
    colour = models.CharField(max_length=64)
    tidal_influence = models.CharField(choices=YesNoUnknown)
    comment = models.TextField(max_length=512)

    class Meta:
        db_table = '"activity"."waterbody_data"'
        pass
