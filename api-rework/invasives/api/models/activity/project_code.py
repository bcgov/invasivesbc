from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData


class ProjectCodeMixin(models.Model):
    description = models.CharField(max_length=64)

    class Meta:
        abstract = True


class ProjectCode(ProjectCodeMixin, RepeatedFormData):

    class Meta:
        db_table = '"activity"."project_code"'
        db_table_comment = "Project codes can be created for a user to organize their records in a way meaningful to them"


class DraftProjectCode(ProjectCodeMixin, DraftRepeatedFormData):
    description = models.CharField(max_length=64, blank=True, null=True)

    class Meta:
        db_table = '"draft_activity"."project_code"'
        db_table_comment = "Project codes can be created for a user to organize their records in a way meaningful to them"
