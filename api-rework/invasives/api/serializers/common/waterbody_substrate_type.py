from rest_framework import serializers
from api.models.activity import (
    WaterbodySubstrateType,
    DraftWaterbodySubstrateType,
)


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ["substrate_type"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return ret["substrate_type"]


class WaterbodySubstrateTypeSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = WaterbodySubstrateType


class DraftWaterbodySubstrateTypeSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftWaterbodySubstrateType
