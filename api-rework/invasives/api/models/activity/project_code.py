from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable


class ProjectCode(BaseOneToManyActivityTable):
    description = models.CharField(max_length=64)

    class Meta:
        db_table = '"activity"."project_code"'
        db_table_comment = "Project codes can be created for a user to organize their records in a way meaningful to them"
        constraints = [
            models.UniqueConstraint(
                fields=["activity_id", "description"],
                name="unique_activity_description",
            )
        ]

    def __str__(self):
        return f"{self.activity_id.short_id}: {self.description}"
