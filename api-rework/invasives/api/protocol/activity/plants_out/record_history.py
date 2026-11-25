from ninja import ModelSchema, Field
from api.models.audits import ActivityModificationRecord


class RecordHistoryOut(ModelSchema):
    user: str
    activity: str = Field(..., alias="activity.short_id")

    class Meta:
        model = ActivityModificationRecord
        fields = ("date", "version", "platform", "diff")

    @staticmethod
    def resolve_user(obj):
        return obj.user.username if obj.user.username else obj.user.display_name
