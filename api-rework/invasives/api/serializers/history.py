from rest_framework import serializers
from api.models.audits import ActivityModificationRecord


class HistorySerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.display_name")
    activity = serializers.CharField(source="activity.short_id")

    class Meta:
        model = ActivityModificationRecord
        fields = (
            "user",
            "date",
            "version",
            "activity",
            "platform",
            "diff",
        )
