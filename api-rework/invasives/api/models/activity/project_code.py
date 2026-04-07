from django.db import models
from api.models.activity import RepeatedFormData


class ProjectCode(RepeatedFormData):
    description = models.CharField(max_length=64)

    class Meta:
        db_table = '"activity"."project_code"'
        db_table_comment = "Project codes can be created for a user to organize their records in a way meaningful to them"
