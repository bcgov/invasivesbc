from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.viewsets.activity import ActivityViewSet
from api.viewsets.code import CodeViewSet
from api.viewsets.migration import MigrationStatusViewSet

ROUTER = DefaultRouter(trailing_slash=False)

ROUTER.register(r"activities", ActivityViewSet, "activity")
ROUTER.register(r"codes", CodeViewSet, "code")
ROUTER.register(r"migrations", MigrationStatusViewSet, "migration")

urlpatterns = [path("", include(ROUTER.urls))]
