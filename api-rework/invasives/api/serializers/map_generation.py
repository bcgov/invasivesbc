import json

from rest_framework import serializers

from api.models import (
    RasterMapGenerationRequest,
    MapGenerationRecord,
    MapGenerationIntermediateResult,
)


class MapGenerationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RasterMapGenerationRequest
        fields = "__all__"


class MapGenerationRecordSerializer(serializers.ModelSerializer):
    bounds = serializers.SerializerMethodField()

    def get_bounds(self, obj):
        return json.loads(obj.bounds.geojson)

    class Meta:
        model = MapGenerationRecord
        fields = "__all__"


class MapGenerationIntermediateResultSerializer(serializers.ModelSerializer):

    class Meta:
        model = MapGenerationIntermediateResult
        fields = "__all__"
