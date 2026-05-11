from django.db import models


class Dated(models.Model):

    created = models.DateTimeField(
        auto_now_add=True, db_column="created_at", db_comment="Creation timestamp"
    )
    updated = models.DateTimeField(
        auto_now=True, db_column="updated_at", db_comment="Updated timestamp"
    )

    class Meta:
        abstract = True
