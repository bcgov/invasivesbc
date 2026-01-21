
from rest_framework import serializers
from api.models.activity import SpreadResults

class SpreadResultsSerializer(serializers.ModelSerializer):
  class Meta:
    model = SpreadResults
    fields = (
      "agent_density",
      "plant_attack",
      "max_spread_distance_m",
      "max_spread_aspect_deg"
    )
