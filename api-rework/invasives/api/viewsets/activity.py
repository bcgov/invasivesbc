import json
import logging

import psycopg
from django.contrib.gis.db.models.functions import Centroid, AsGeoJSON
from django.db.models import Q
from django.http.response import HttpResponse
from psycopg.rows import dict_row
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.legacy_db.db import LegacyDB
from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity.activity import Activity
from api.models.migrator.activity_migration_status import ActivityMigrationStatus
from api.serializers.activity import ActivityListSerializer, ActivitySerializer
from api.serializers.activity_migration_status import ActivityMigrationStatusSerializer
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING


class ActivityViewSet(ReadOnlyModelViewSet):
    querysets = {
        "list": Activity.objects.annotate(
            has_migration_remarks=Q(migration_remarks__isnull=False)
        ).values("id", "type", "subtype", "date", "has_migration_remarks"),
        "default": Activity.objects.annotate(centroid=AsGeoJSON(Centroid("shape")))
        .prefetch_related()
        .all(),
    }
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.action in self.querysets.keys():
            return self.querysets[self.action]

        return self.querysets["default"]

    def get_serializer_class(self):
        if self.action == "list":
            return ActivityListSerializer
        return ActivitySerializer

    @action(detail=True, methods=["get"])
    def migration_status(self, request, *args, **kwargs):
        try:
            found = ActivityMigrationStatus.objects.get(activity_id=self.kwargs["pk"])
            serialized = ActivityMigrationStatusSerializer(found)
            return Response(data=serialized.data, status=HTTP_200_OK)
        except Exception as e:
            logging.error(e)
            return Response(status=404)

    @action(detail=True, methods=["post"])
    def migrate(self, request, *args, **kwargs):
        try:
            LegacyDB.migrate_activities(
                source="single", dry_run=False, clobber=True, pk=self.kwargs["pk"]
            )
            return Response(status=HTTP_200_OK)
        except Exception as e:
            logging.error("error migrating activity", exc_info=True)
            return Response(status=500)

    @action(detail=True, methods=["get"])
    def legacy(self, request, *args, **kwargs):
        with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                response = cursor.execute(
                    "select activity_id, activity_type, activity_subtype, activity_payload from invasivesbc.activity_incoming_data where iscurrent=true and activity_payload->>'form_status' like 'Submitted' and activity_id=%s",
                    (kwargs["pk"],),
                )
                if cursor.rowcount <= 0:
                    return Response(status=404)
                return Response(response.fetchone(), status=HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def pydantic(self, request, *args, **kwargs):
        try:
            with psycopg.connect(
                LEGACY_DB_CONNECTION_STRING, row_factory=dict_row
            ) as conn:
                with conn.cursor() as cursor:
                    response = cursor.execute(
                        "select activity_id, activity_type, activity_subtype, activity_payload from invasivesbc.activity_incoming_data where iscurrent=true and activity_payload->>'form_status' like 'Submitted' and activity_id=%s",
                        (kwargs["pk"],),
                    )
                    parsed = LegacyActivity.model_validate(
                        response.fetchone(), extra="forbid"
                    )
                    return HttpResponse(
                        parsed.model_dump_json(),
                        status=HTTP_200_OK,
                        content_type="application/json",
                    )
        except Exception as e:
            return HttpResponse(
                content=json.dumps({"exception": e.__str__()}),
                status=500,
                content_type="application/json",
            )
