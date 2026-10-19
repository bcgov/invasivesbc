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
)

from api.protocol.activity.api import router as activity_router
from api.protocol.map_tiles import tile_router
from api.protocol.summary import summary_router, SUMMARY_PATH
from api.protocol.teams import teams_router, TEAMS_ROOT_PATH
from api.protocol.recordset import recordset_router, RECORDSET_ROOT_PATH

from ninja import NinjaAPI

ROUTER = DefaultRouter(trailing_slash=False)

ROUTER.register(r"activities", ActivityViewSet, "activity")
ROUTER.register(r"codes", CodeViewSet, "code")
ROUTER.register(r"health", HealthViewset, "health")
ROUTER.register(r"ids-within-bounds", IdsWithinBoundsViewSet, "ids-within-bounds")
ROUTER.register(r"maps/records", MapGenerationRecordViewset, "map_generation_record")
ROUTER.register(r"maps/requests", MapGenerationRequestViewSet, "map_generation_request")
ROUTER.register(r"migrations", MigrationStatusViewSet, "migration")

ninja_api = NinjaAPI()
ninja_api.add_router("/activities", activity_router)
ninja_api.add_router(RECORDSET_ROOT_PATH, recordset_router)
ninja_api.add_router(SUMMARY_PATH, summary_router)
ninja_api.add_router(TEAMS_ROOT_PATH, teams_router)
ninja_api.add_router("/tiles", tile_router)

urlpatterns = [path("", include(ROUTER.urls)), path("ninja/", ninja_api.urls)]
