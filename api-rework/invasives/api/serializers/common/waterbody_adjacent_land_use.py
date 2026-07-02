from rest_framework import serializers
from api.models.activity import WaterbodyAdjacentLandUse, DraftWaterbodyAdjacentLandUse


class BaseSerializer(serializers.ModelSerializer):

    class Meta:
        abstract = True
        fields = ["waterbody_adjacent_land_use"]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return ret["waterbody_adjacent_land_use"]


class WaterbodyAdjacentLandUseSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = WaterbodyAdjacentLandUse


class DraftWaterbodyAdjacentLandUseSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftWaterbodyAdjacentLandUse
