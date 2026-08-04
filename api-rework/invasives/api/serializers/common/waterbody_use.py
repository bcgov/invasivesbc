from rest_framework import serializers
from api.models.activity import WaterbodyUse, DraftWaterbodyUse


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ["waterbody_use"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return ret["waterbody_use"]


class WaterbodyUseSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = WaterbodyUse


class DraftWaterbodyUseSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftWaterbodyUse
