from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.viewsets.activity import ActivityViewSet
from api.viewsets.code import CodeViewSet
from api.viewsets.migration import MigrationStatusViewSet
from api.viewsets.ids_within_bounds import IdsWithinBoundsViewSet
from api.viewsets.recordset_rows import RecordsetRowsViewSet
from api.viewsets.submission import SubmissionViewSet

from api.protocol.activity.api import router as activity_router

from ninja import NinjaAPI

ROUTER = DefaultRouter(trailing_slash=False)

ROUTER.register(r"activities", ActivityViewSet, "activity")
ROUTER.register(r"codes", CodeViewSet, "code")
ROUTER.register(r"migrations", MigrationStatusViewSet, "migration")
ROUTER.register(r"ids-within-bounds", IdsWithinBoundsViewSet, "ids-within-bounds")
ROUTER.register(r"recordset-rows", RecordsetRowsViewSet, "recordsets")
ROUTER.register(r"entries", SubmissionViewSet, "entries")

ninja_api = NinjaAPI()
ninja_api.add_router("/activities", activity_router)

urlpatterns = [path("", include(ROUTER.urls)), path("ninja/", ninja_api.urls)]
