from django.db import models
from api.models.enums.yes_no_unknown import YesNoUnknown
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from api.models.enums.waterbody_type import WaterbodyType


class WaterbodyContext(BaseOneToOneActivityTable):
    type = models.TextField(choices=WaterbodyType)
    name_gazetted = models.CharField(max_length=256)
    name_local = models.CharField(max_length=256)
    access = models.CharField(max_length=64)
    max_depth_m = models.PositiveSmallIntegerField()
    secchi_depth = models.PositiveSmallIntegerField()
    colour = models.CharField(max_length=64)
    tidal_influence = models.CharField(choices=YesNoUnknown)
    comment = models.TextField(max_length=16384)

    class Meta:
        db_table = '"activity"."waterbody_context"'
