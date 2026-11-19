from ninja import ModelSchema, Schema
from typing import List
from api.models.app_report import BugReport


class BugReportResponseOut(Schema):
    entries: List[BugReportOut]


class BugReportOut(ModelSchema):
    class Meta:
        model = BugReport
        fields = (
            "id",
            "title",
            "created_timestamp",
            "device",
            "reproducible",
            "issue_type",
            "offline",
            "online",
            "status",
        )


class SingleBugReportOut(ModelSchema):
    class Meta:
        model = BugReport
        fields = (
            "id",
            "title",
            "created_timestamp",
            "description",
            "device",
            "expected_behavior",
            "reproducible",
            "issue_type",
            "offline",
            "online",
            "status",
        )
