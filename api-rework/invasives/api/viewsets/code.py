from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import AllowAny

from api.models import BaseCode, WaterbodyUseCode
from api.serializers import CodeSerializer


class CodeViewSet(ReadOnlyModelViewSet):
    queryset = WaterbodyUseCode.objects.all()
    serializer_class = CodeSerializer
    permission_classes = [AllowAny]
