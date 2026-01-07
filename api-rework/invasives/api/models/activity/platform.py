from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from api.models_public.enums import PlatformSource


class Platform(BaseOneToOneActivityTable):
    src = models.CharField(
        choices=PlatformSource, db_index=True, default=PlatformSource.Unknown
    )

    class Meta:
        db_table = '"activity"."platform"'
        db_table_comment = (
            "Device form was originally created on (IOS, Android, Batch, etc...)"
        )

    def __str__(self):
        return self.src
