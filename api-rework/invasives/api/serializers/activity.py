from rest_framework import serializers

from api.models.activity.activity_basic import ActivityBasic
from api.serializers.jurisdiction import JurisdictionSerializer


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
    jurisdictions = JurisdictionSerializer(source='jurisdiction_set', many=True)
    class Meta:
        model = ActivityBasic
        fields = "__all__"
