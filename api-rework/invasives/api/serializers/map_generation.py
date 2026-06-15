import logging
import math
from datetime import timedelta

import boto3
from botocore.exceptions import ClientError
from django.db.models import Q
from pydantic import TypeAdapter
from rest_framework import serializers

from api.models import (
    RasterMapGenerationRequest,
    MapGenerationRecord,
    MapGenerationIntermediateResult,
)
from api.models.map_generation.map_generation_request import MAX_TILE_COUNT
from api.serializers.common.polygon import CentroidSerializer, PolygonSerializer
from invasivesbc.settings import (
    OBJECT_STORE_SECRET_ACCESS_KEY,
    OBJECT_STORE_ACCESS_KEY_ID,
    OBJECT_STORE_ENDPOINT_URL,
    OBJECT_STORE_MAP_UPLOAD_BUCKET,
    OBJECT_STORE_REGION,
)


class MapGenerationIntermediateResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapGenerationIntermediateResult
        fields = (
            "tiles_downloaded",
            "cache_hits",
            "cache_misses",
            "remaining_tiles",
            "seconds_elapsed",
            "status_information",
        )
        read_only_fields = fields


class MapGenerationEstimateSerializer(serializers.ModelSerializer):
    bounds = PolygonSerializer()

    is_size_valid = serializers.SerializerMethodField(read_only=True)
    is_trip_name_valid = serializers.SerializerMethodField(read_only=True)

    def get_is_size_valid(self, obj):
        return obj.total_tile_count <= MAX_TILE_COUNT

    def get_is_trip_name_valid(self, obj):
        if obj.trip_name is None:
            return None

        request = self.context.get("request", None)

        return not RasterMapGenerationRequest.objects.filter(
            trip_name=obj.trip_name,
            owner=request.user if request else None,
        ).exists()

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
            "is_size_valid",
            "is_trip_name_valid",
        )
        fields = (
            "minimum_zoom",
            "maximum_zoom",
            "bounds",
            "trip_name",
            "tile_definition_source_name",
            "total_tile_count",
            "estimated_final_size",
            "estimated_download_time_best_case",
            "estimated_download_time_worst_case",
            "area_km2",
            "is_size_valid",
            "is_trip_name_valid",
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
            "trip_name",
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
            "trip_name",
        )


class MapGenerationRequestProgressAndLinkSerializer(
    MapGenerationRequestShallowSerializer
):
    def get_progress(self, obj):
        record = MapGenerationIntermediateResult.objects.filter(
            Q(generation_request=obj)
        ).first()

        if not record:
            return None

        return {
            "seconds_elapsed": record.seconds_elapsed,
            "downloaded": record.tiles_downloaded,
            "total": obj.total_tile_count,
        }

    def get_file_size(self, obj):
        record = MapGenerationRecord.objects.filter(
            Q(owner=obj.owner) & Q(generation_request=obj)
        ).first()

        if record is None:
            return None

        return record.file_size

    progress = serializers.SerializerMethodField(read_only=True)
    file_size = serializers.SerializerMethodField(read_only=True)
    time_to_expiry = serializers.SerializerMethodField(read_only=True)

    def get_time_to_expiry(self, obj):
        record = MapGenerationRecord.objects.filter(
            Q(owner=obj.owner) & Q(generation_request=obj)
        ).first()

        if record is None:
            return None

        resolution_seconds = 300

        timedelta_adapter = TypeAdapter(timedelta)
        rounded = (
            round(record.time_to_expiry.total_seconds() / resolution_seconds)
            * resolution_seconds
        )

        return timedelta_adapter.dump_python(timedelta(seconds=rounded), mode="json")

    class Meta:
        model = MapGenerationRequestShallowSerializer.Meta.model
        read_only_fields = (
            MapGenerationRequestShallowSerializer.Meta.read_only_fields
            + (
                "progress",
                "file_size",
                "time_to_expiry",
            )
        )

        fields = MapGenerationRequestShallowSerializer.Meta.fields + (
            "progress",
            "file_size",
            "time_to_expiry",
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
            "trip_name",
        )


class MapGenerationRequestMonitoringSerializer(MapGenerationRequestSerializer):
    intermediate_results = MapGenerationIntermediateResultSerializer()

    class Meta:
        model = RasterMapGenerationRequest
        fields = MapGenerationRequestSerializer.Meta.fields + ("intermediate_results",)


class MapGenerationRecordSerializer(serializers.ModelSerializer):
    bounds = PolygonSerializer()
    centroid = CentroidSerializer(source="bounds")

    download_link = serializers.SerializerMethodField()

    def get_download_link(self, obj):
        # todo use django's caching mechanisms to speed this up
        try:
            s3_client = boto3.client(
                "s3",
                endpoint_url=OBJECT_STORE_ENDPOINT_URL,
                aws_access_key_id=OBJECT_STORE_ACCESS_KEY_ID,
                aws_secret_access_key=OBJECT_STORE_SECRET_ACCESS_KEY,
                region_name=OBJECT_STORE_REGION,
                aws_session_token=None,
                config=boto3.session.Config(
                    signature_version="s3v4",
                    request_checksum_calculation="when_required",
                    response_checksum_validation="when_required",
                ),
            )
            response = s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": OBJECT_STORE_MAP_UPLOAD_BUCKET, "Key": obj.file_name},
                ExpiresIn=int(timedelta(days=7).total_seconds()),
            )
            return response
        except ClientError:
            logging.error("Unable to generate pre-signed URL", exc_info=True)
            return None

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
            "trip_name",
            "download_link",
        )
