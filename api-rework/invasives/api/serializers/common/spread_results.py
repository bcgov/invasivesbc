from rest_framework import serializers
from api.models.activity import SpreadResults, DraftSpreadResults


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = (
            "agent_density",
            "plant_attack",
            "max_spread_distance_m",
            "max_spread_aspect_deg",
        )


class SpreadResultsSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = SpreadResults


class DraftSpreadResultsSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftSpreadResults
