from datetime import datetime

from django.db import transaction
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_404_NOT_FOUND

from api.models import MapGenerationRecord, RasterMapGenerationRequest
from api.permissions import HasAdminRole
from api.serializers.map_generation import (
    MapGenerationEstimateSerializer,
    MapGenerationRecordSerializer,
    MapGenerationRequestSerializer,
    MapGenerationRequestShallowSerializer,
)
from api.serializers.map_generation import (
    MapGenerationRequestProgressAndLinkSerializer,
)
from api.services.map_tile_generator.definitions import ProtomapGenerationParameters
from api.tasks import dispatch_map_generation_request


class MapGenerationRequestViewSet(viewsets.ViewSet):
    permission_classes = [HasAdminRole]
    http_method_names = ["get", "post", "put"]

    def retrieve(self, request, *args, **kwargs):
        result = (
            RasterMapGenerationRequest.objects.filter(owner=request.user)
            .filter(id=kwargs["pk"])
            .first()
        )

        if result is None:
            return Response(status=HTTP_404_NOT_FOUND)

        serializer = MapGenerationRequestSerializer(result)

        return Response(data=serializer.data, status=HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = MapGenerationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        created = serializer.save(
            owner=request.user,
            file_name=f"user_{request.user.subject}-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        )

        # queue the actual generation process via celery
        transaction.on_commit(
            lambda: dispatch_map_generation_request(
                ProtomapGenerationParameters(map_generation_request_id=created.id)
            )
        )

        return Response(serializer.data, status=HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def estimate(self, request, *args, **kwargs):
        serializer = MapGenerationEstimateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(owner=request.user)
        return Response(serializer.data, status=HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def offline_maps_page_list(self, request):
        result = RasterMapGenerationRequest.objects.filter(owner=request.user).order_by(
            "-updated"
        )

        serializer = MapGenerationRequestProgressAndLinkSerializer(result, many=True)

        return Response(data=serializer.data, status=HTTP_200_OK)

    def list(self, request):
        result = RasterMapGenerationRequest.objects.filter(owner=request.user).order_by(
            "-updated"
        )

        serializer = MapGenerationRequestShallowSerializer(result, many=True)

        return Response(data=serializer.data, status=HTTP_200_OK)


class MapGenerationRecordViewset(viewsets.ViewSet):

    permission_classes = [HasAdminRole]
    http_method_names = ["get"]

    def retrieve(self, request, *args, **kwargs):
        result = (
            MapGenerationRecord.objects.filter(Q(owner=request.user) | Q(owner=None))
            .filter(id=kwargs["pk"])
            .first()
        )

        if result is None:
            return Response(status=HTTP_404_NOT_FOUND)

        serializer = MapGenerationRecordSerializer(result)

        return Response(data=serializer.data, status=HTTP_200_OK)

    def list(self, request):
        result = MapGenerationRecord.objects.filter(
            Q(owner=request.user) | Q(owner=None)
        ).order_by("-updated")

        serializer = MapGenerationRecordSerializer(result, many=True)

        return Response(data=serializer.data, status=HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def public(self, request):
        result = MapGenerationRecord.objects.filter(Q(owner=None)).order_by("-updated")

        serializer = MapGenerationRecordSerializer(result, many=True)

        return Response(data=serializer.data, status=HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def owned(self, request):
        result = MapGenerationRecord.objects.filter(Q(owner=request.user)).order_by(
            "-updated"
        )

        serializer = MapGenerationRecordSerializer(result, many=True)

        return Response(data=serializer.data, status=HTTP_200_OK)
