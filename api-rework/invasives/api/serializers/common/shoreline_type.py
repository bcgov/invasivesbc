from rest_framework import serializers
from api.models.activity import ShorelineTypes


class ShorelineTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShorelineTypes
        fields = ("shoreline_type", "percent_covered")
