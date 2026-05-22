import logging
from datetime import timedelta

import boto3
from botocore.exceptions import ClientError
from rest_framework import serializers

from api.models import (
    RasterMapGenerationRequest,
    MapGenerationRecord,
    MapGenerationIntermediateResult,
)
from django.db.models import Q

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
            "download_link",
        )
