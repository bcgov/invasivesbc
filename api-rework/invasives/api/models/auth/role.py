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

    @property
    def code(self):
        return self.name

    @property
    def full(self):
        return self.description

    @property
    def code_sort_order(self):
        return None

    @property
    def valid_to(self):
        return None

    class Meta:
        db_table = '"authentication"."role"'
