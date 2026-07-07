from rest_framework import serializers
from api.models.activity import TargetPlantHeights, DraftTargetPlantHeights


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ["height_cm"]


class TargetPlantHeightsSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = TargetPlantHeights


class DraftTargetPlantHeightsSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = DraftTargetPlantHeights
