from ninja import Field, ModelSchema, Schema
from typing import List
from api.models.app_report import BugReport
from datetime import date


class BugReportResponseOut(Schema):
    entries: List[BugReportRowOut]


class BugReportRowOut(ModelSchema):
    date: date
    time: str
    offline_online: str
    reproducible: str
    issue_type: str = Field(..., alias="issue_type.full")

    class Meta:
        model = BugReport
        fields = (
            "id",
            "title",
            "device",
            "issue_type",
            "status",
        )

    @staticmethod
    def resolve_date(obj):
        return obj.created_timestamp.date()

    @staticmethod
    def resolve_time(obj):
        return obj.created_timestamp.strftime("%I:%M %p")

    @staticmethod
    def resolve_reproducible(obj):
        return "Yes" if obj.reproducible else "No"

    @staticmethod
    def resolve_offline_online(obj):
        return (
            "Both"
            if obj.offline and obj.online
            else ("Offline" if obj.offline else "Online")
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
