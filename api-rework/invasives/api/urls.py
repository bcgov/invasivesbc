from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.viewsets.activity import ActivityViewSet
from api.viewsets.code import CodeViewSet

ROUTER = DefaultRouter(trailing_slash=False)

ROUTER.register(r"activities", ActivityViewSet, "activity")
ROUTER.register(r"codes", CodeViewSet, "code")

urlpatterns = [path("", include(ROUTER.urls))]
