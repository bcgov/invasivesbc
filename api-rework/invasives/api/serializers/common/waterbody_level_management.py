from rest_framework import serializers
from api.models.activity import (
    WaterbodyLevelManagement,
    DraftWaterbodyLevelManagement,
)


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ["waterlevel_management"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return ret["waterlevel_management"]


class WaterbodyLevelManagementSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = WaterbodyLevelManagement


class DraftWaterbodyLevelManagementSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftWaterbodyLevelManagement
