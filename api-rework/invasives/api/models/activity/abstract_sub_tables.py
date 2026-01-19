from django.db import models

from api.models.activity.activity import Activity


class BaseOneToOneActivityTable(models.Model):
    """
    For Activity subtables with a 1:1 Relationship.
    """

    activity = models.OneToOneField(
        Activity,
        on_delete=models.CASCADE,
    )

    class Meta:
        abstract = True


class BaseOneToManyActivityTable(models.Model):
    """
    For Activity subtables with a 1:M Relationship.
    """

    activity = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
    )

    class Meta:
        abstract = True
