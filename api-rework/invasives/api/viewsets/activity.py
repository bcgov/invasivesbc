from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import AllowAny

from api.models import ActivityBasic
from api.serializers import ActivitySerializer


class ActivityViewSet(ReadOnlyModelViewSet):
    queryset = ActivityBasic.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [AllowAny]
