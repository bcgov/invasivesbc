from api.models.auth import User
from django.db import models
from api.models.enums import PlatformSource, BugReportStatus
from api.models.codes.code_tables import BugReportTypeCode


class BugReport(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_timestamp = models.DateTimeField(auto_now_add=True)
    device = models.CharField(choices=PlatformSource, max_length=24)
    description = models.CharField(max_length=8192)
    title = models.CharField(max_length=100)
    reproducible = models.BooleanField()
    expected_behavior = models.CharField(max_length=8192, null=True, blank=True)
    offline = models.BooleanField()
    online = models.BooleanField()
    issue_type = models.ForeignKey(BugReportTypeCode, on_delete=models.PROTECT)
    status = models.CharField(
        choices=BugReportStatus, max_length=24, default=BugReportStatus.Open.value
    )

    class Meta:
        db_table = '"app_report"."bug_report"'
