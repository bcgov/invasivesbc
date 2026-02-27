from rest_framework import serializers
from api.models.activity import TargetPlantPhenology, TargetPlantHeights


class TargetPlantHeightsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TargetPlantHeights
        fields = ["height_cm"]


class TargetPlantPhenologySerializer(serializers.ModelSerializer):
    target_plant_heights = serializers.SerializerMethodField()

    class Meta:
        model = TargetPlantPhenology
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

    def get_target_plant_heights(self, obj):
        tph = TargetPlantHeights.objects.filter(activity=obj.activity)
        return TargetPlantHeightsSerializer(tph, many=True).data
