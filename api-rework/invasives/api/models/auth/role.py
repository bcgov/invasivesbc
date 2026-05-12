from django.db import models


class Role(models.Model):

    name = models.CharField(
        blank=False,
        null=False,
        max_length=64,
        unique=True,
        db_index=True,
        primary_key=True,
    )

    class Meta:
        db_table = '"authentication"."role"'
