from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .viewsets import (
    ActivityViewSet,
    CodeViewSet,
    HealthViewset,
    MapGenerationRecordViewset,
    MapGenerationRequestViewSet,
    MigrationStatusViewSet,
    IdsWithinBoundsViewSet,
    RecordsetRowsViewSet,
    VectorTileViewset,
)

from api.protocol.activity.api import router as activity_router

from ninja import NinjaAPI

ROUTER = DefaultRouter(trailing_slash=False)

ROUTER.register(r"activities", ActivityViewSet, "activity")
ROUTER.register(r"codes", CodeViewSet, "code")
ROUTER.register(r"health", HealthViewset, "health")
ROUTER.register(r"ids-within-bounds", IdsWithinBoundsViewSet, "ids-within-bounds")
ROUTER.register(r"maps/records", MapGenerationRecordViewset, "map_generation_record")
ROUTER.register(r"maps/requests", MapGenerationRequestViewSet, "map_generation_request")
ROUTER.register(r"migrations", MigrationStatusViewSet, "migration")
ROUTER.register(r"recordset", RecordsetRowsViewSet, "recordsets")
ROUTER.register(r"tiles", VectorTileViewset, "tiles")

ninja_api = NinjaAPI()
ninja_api.add_router("/activities", activity_router)

urlpatterns = [path("", include(ROUTER.urls)), path("ninja/", ninja_api.urls)]
urlpatterns += [path("silk/", include("silk.urls", namespace="silk"))]
