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

    description = models.TextField(
        blank=False,
        null=False,
        db_comment="User-facing description for the role",
        default="Unset",
    )

    class Meta:
        db_table = '"authentication"."role"'
