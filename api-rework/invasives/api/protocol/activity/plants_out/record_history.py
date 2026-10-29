from ninja import ModelSchema, Field
from api.models.audits import ActivityModificationRecord


class RecordHistoryOut(ModelSchema):
    user: str = Field(..., alias="user.display_name")
    activity: str = Field(..., alias="activity.short_id")

    class Meta:
        model = ActivityModificationRecord
        fields = ("date", "version", "platform", "diff")
