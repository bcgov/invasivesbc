from rest_framework import serializers

from api.models import (
    RasterMapGenerationRequest,
    MapGenerationRecord,
    MapGenerationIntermediateResult,
)
from django.db.models import Q

from api.serializers.common.polygon import CentroidSerializer, PolygonSerializer


class MapGenerationIntermediateResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapGenerationIntermediateResult
        fields = (
            "tiles_downloaded",
            "cache_hits",
            "cache_misses",
            "remaining_tiles",
            "status_information",
        )
        read_only_fields = fields


class MapGenerationEstimateSerializer(serializers.ModelSerializer):
    bounds = PolygonSerializer()

    def create(self, validated_data, **kwargs):
        # this serializer does not persist anything to the database - it's for estimating download time only
        return RasterMapGenerationRequest(**validated_data)

    class Meta:
        model = RasterMapGenerationRequest
        read_only_fields = (
            "tile_definition_source_name",
            "total_tile_count",
            "estimated_final_size",
            "estimated_download_time_best_case",
            "estimated_download_time_worst_case",
            "area_km2",
        )
        fields = (
            "minimum_zoom",
            "maximum_zoom",
            "bounds",
            "tile_definition_source_name",
            "total_tile_count",
            "estimated_final_size",
            "estimated_download_time_best_case",
            "estimated_download_time_worst_case",
            "area_km2",
        )


class MapGenerationRequestShallowSerializer(serializers.ModelSerializer):
    bounds = PolygonSerializer()
    centroid = CentroidSerializer(source="bounds", read_only=True)
    generation_record = serializers.SerializerMethodField()

    def get_generation_record(self, obj):
        record = MapGenerationRecord.objects.filter(
            Q(owner=obj.owner) & Q(generation_request=obj)
        ).first()

        if not record:
            return None

        return record.id

    class Meta:
        model = RasterMapGenerationRequest
        read_only_fields = (
            "id",
            "status",
            "file_name",
            "total_tile_count",
            "created",
            "updated",
            "area_km2",
            "centroid",
            "generation_record",
        )

        fields = (
            "id",
            "minimum_zoom",
            "maximum_zoom",
            "bounds",
            "status",
            "file_name",
            "total_tile_count",
            "created",
            "updated",
            "area_km2",
            "centroid",
            "generation_record",
        )


class MapGenerationRequestSerializer(serializers.ModelSerializer):
    bounds = PolygonSerializer()
    centroid = CentroidSerializer(source="bounds", read_only=True)
    generation_record = serializers.SerializerMethodField()

    intermediate_results = serializers.SerializerMethodField()

    def get_intermediate_results(self, obj):
        record = MapGenerationIntermediateResult.objects.filter(
            Q(generation_request=obj)
        ).first()

        if not record:
            return None

        return MapGenerationIntermediateResultSerializer(record).data

    def get_generation_record(self, obj):
        record = MapGenerationRecord.objects.filter(
            Q(owner=obj.owner) & Q(generation_request=obj)
        ).first()

        if not record:
            return None

        return MapGenerationRecordSerializer(record).data

    class Meta:
        model = RasterMapGenerationRequest
        read_only_fields = (
            "id",
            "status",
            "tile_definition_source_name",
            "file_name",
            "total_tile_count",
            "created",
            "updated",
            "area_km2",
            "centroid",
            "generation_record",
            "intermediate_results",
        )

        fields = (
            "id",
            "minimum_zoom",
            "maximum_zoom",
            "bounds",
            "status",
            "tile_definition_source_name",
            "file_name",
            "total_tile_count",
            "created",
            "updated",
            "area_km2",
            "centroid",
            "generation_record",
            "intermediate_results",
        )


class MapGenerationRequestMonitoringSerializer(MapGenerationRequestSerializer):
    intermediate_results = MapGenerationIntermediateResultSerializer()

    class Meta:
        model = RasterMapGenerationRequest
        fields = MapGenerationRequestSerializer.Meta.fields + ("intermediate_results",)


class MapGenerationRecordSerializer(serializers.ModelSerializer):
    bounds = PolygonSerializer()
    centroid = CentroidSerializer(source="bounds")

    class Meta:
        model = MapGenerationRecord
        fields = (
            "id",
            "minimum_zoom",
            "maximum_zoom",
            "bounds",
            "file_name",
            "file_size",
            "expires",
            "updated",
            "area_km2",
            "centroid",
            "raster",
        )
