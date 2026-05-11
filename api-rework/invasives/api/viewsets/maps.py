from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from api.models import MapGenerationRecord
from api.permissions import HasAdminRole
from api.serializers.map_generation import (
    MapGenerationRecordSerializer,
)


class MapViewSet(viewsets.ViewSet):

    permission_classes = [HasAdminRole]
    http_method_names = ["get"]

    def list(self, request):
        result = MapGenerationRecord.objects.all()

        serializer = MapGenerationRecordSerializer(result, many=True)

        return Response(data=serializer.data, status=HTTP_200_OK)
