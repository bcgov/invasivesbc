from rest_framework import serializers

from api.models import ActivityBasic


class ActivityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityBasic
        fields = (
            "activity_id",
            "activity_type",
            "activity_subtype",
            "activity_date",
        )


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityBasic
        fields = "__all__"
