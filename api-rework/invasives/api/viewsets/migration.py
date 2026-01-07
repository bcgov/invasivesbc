from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.models.migrator.activity_migration_status import ActivityMigrationStatus
from api.serializers.activity_migration_status import ActivityMigrationStatusSerializer


class MigrationStatusViewSet(ReadOnlyModelViewSet):
    queryset = ActivityMigrationStatus.objects.all()
    permission_classes = [AllowAny]
    serializer_class = ActivityMigrationStatusSerializer

    @action(detail=False, methods=["get"])
    def failed(self, request, *args, **kwargs):
        obj = ActivityMigrationStatus.objects.filter(success=False)
        serializer = ActivityMigrationStatusSerializer(obj, many=True)
        return Response(serializer.data, status=HTTP_200_OK)
