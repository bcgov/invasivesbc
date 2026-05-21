import logging

from rest_framework.decorators import action
from django.db.models import (
    Q,
)
from rest_framework import viewsets, status
from rest_framework.response import Response
from api.models.activity import Activity
from api.permissions import HasAdminRole
from api.serializers.activity_recordset_row import (
    ActivityRecordsetRowSerializer,
    CachedActivityRecordsetRowSerializer,
)
from api.utils.filtered_activity_queryset import FilteredActivityQueryset
from api.constants import uuid_regex, short_id_regex

log = logging.getLogger("invasives")

CENTROID_ZOOM_LIMIT = 12


class RecordsetRowsViewSet(viewsets.GenericViewSet):
    serializer_class = ActivityRecordsetRowSerializer
    permission_classes = [HasAdminRole]

    @action(detail=False, methods=["GET"])
    def cache(self, request, *args, **kwargs):
        """
        Given a 'idList' query param of IDs (short or full)
        return a list of Recordset rows and data payloads (For caching purposes)
        """
        id_list = request.GET.get("idList", []).split(",")
        if len(id_list) == 0:
            return Response("No IDs provided", status=status.HTTP_400_BAD_REQUEST)

        uuids = []
        short_ids = []
        for id in id_list:
            if uuid_regex.match(id):
                uuids.append(id)
            elif short_id_regex.match(id):
                short_ids.append(id)
            else:
                return Response(f"Invalid ID: {id}", status=status.HTTP_400_BAD_REQUEST)

        results = Activity.objects.filter(Q(id__in=uuids) | Q(short_id__in=short_ids))
        serializer = CachedActivityRecordsetRowSerializer(results, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["POST"])
    def rows(self, request, *args, **kwargs):
        filter_objects = request.data.get("filterObjects", [])
        meta = filter_objects[0] if filter_objects else {}
        ids_only = (
            len(meta.get("selectColumns", [])) == 1
            and meta.get("selectColumns")[0] == "activity_id"
        )

        if ids_only:  # Early Return, just ship IDs
            id_list = FilteredActivityQueryset(filter_objects).query(ids_only=True)
            return Response(list(id_list), status=status.HTTP_200_OK)

        queryset = FilteredActivityQueryset(filter_objects).query(paginate=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
