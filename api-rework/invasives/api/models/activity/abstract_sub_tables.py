from api.models.activity.activity import Activity
from django.db import models


class BaseOneToOneActivityTable(models.Model):
    """
    For Activity subtables with a 1:1 Relationship.
    """

    activity_id = models.OneToOneField(
        Activity,
        on_delete=models.CASCADE,
    )

    class Meta:
        abstract = True


class BaseOneToManyActivityTable(models.Model):
    """
    For Activity subtables with a 1:M Relationship.
    """

    activity_id = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
    )

    class Meta:
        abstract = True
