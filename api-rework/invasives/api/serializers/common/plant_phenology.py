from rest_framework import serializers
from api.serializers.common import (
    TargetPlantHeightsSerializer,
    DraftTargetPlantHeightsSerializer,
)
from api.models.activity import (
    TargetPlantPhenology,
    TargetPlantHeights,
    DraftTargetPlantPhenology,
    DraftTargetPlantHeights,
)


class BaseSerializer(serializers.ModelSerializer):
    target_plant_heights = serializers.SerializerMethodField()

    class Meta:
        abstract = True
        fields = (
            "winter_dormant",
            "seedlings",
            "rosettes",
            "bolts",
            "flowering",
            "seeds_forming",
            "senescent",
            "target_plant_heights",
        )


class TargetPlantPhenologySerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = TargetPlantPhenology

    def get_target_plant_heights(self, obj):
        tph = TargetPlantHeights.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return TargetPlantHeightsSerializer(tph, many=True).data


class DraftTargetPlantPhenologySerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftTargetPlantPhenology

    def get_target_plant_heights(self, obj):
        tph = DraftTargetPlantHeights.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return DraftTargetPlantHeightsSerializer(tph, many=True).data
