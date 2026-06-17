from rest_framework import serializers
from api.models.activity import TargetPlantHeights, TargetPlantPhenology


class TargetPlantHeightsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TargetPlantHeights
        fields = ("height_cm",)


class TargetPlantPhenologyWriteSerializer(serializers.ModelSerializer):
    target_plant_heights = TargetPlantHeightsSerializer(many=True)

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
