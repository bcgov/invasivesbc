from django.db import models

from api.models.enums.platform_source import PlatformSource


class Platform(models.Model):
    creating_platform = models.CharField(
        choices=PlatformSource,
        db_index=True,
        default=PlatformSource.Unknown,
        max_length=100,
        null=False,
        db_comment="Device form was originally created on (IOS, Android, Batch, etc...)",
    )

    class Meta:
        abstract = True
