from django.http import HttpResponse
from rest_framework import viewsets, status


class HealthViewset(viewsets.GenericViewSet):
    permission_classes = []
    authentication_classes = []

    def list(self, request):
        return HttpResponse(
            status=status.HTTP_200_OK, content="InvasiveBC API is healthy and ready"
        )
