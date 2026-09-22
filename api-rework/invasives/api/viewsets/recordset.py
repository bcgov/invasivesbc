import csv
import logging

from api.models.export.csv import CSV_EXPORT_ROW_MAP
from api.constants import short_id_regex, uuid_regex
from api.models.activity import Activity
from api.permissions import HasAdminRole
from api.serializers.activity_recordset_row import (
    ActivityRecordsetRowSerializer,
    CachedActivityRecordsetRowSerializer,
)
from api.utils.filtered_activity_queryset import FilteredActivityQueryset
from api.viewsets.mixins.atomic import AtomicViewSetMixin
from django.db.models import Q
from django.http import StreamingHttpResponse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.viewsets import GenericViewSet

log = logging.getLogger("invasives")

CENTROID_ZOOM_LIMIT = 12


class RecordsetRowsViewSet(AtomicViewSetMixin, GenericViewSet):
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
            return Response("No IDs provided", status=HTTP_400_BAD_REQUEST)

        uuids = []
        short_ids = []
        for id in id_list:
            if uuid_regex.match(id):
                uuids.append(id)
            elif short_id_regex.match(id):
                short_ids.append(id)
            else:
                return Response(f"Invalid ID: {id}", status=HTTP_400_BAD_REQUEST)

        results = Activity.objects.filter(Q(id__in=uuids) | Q(short_id__in=short_ids))
        serializer = CachedActivityRecordsetRowSerializer(results, many=True)

        return Response(serializer.data, status=HTTP_200_OK)

    @action(detail=False, methods=["POST"])
    def rows(self, request, *args, **kwargs):
        filter_objects = request.data.get("filterObjects", [])
        meta = filter_objects[0] if filter_objects else {}
        ids_only = meta.get("selectColumns") == ["activity_id"]
        builder = FilteredActivityQueryset(filter_objects=filter_objects)

        if ids_only:  # Early Return, just ship IDs
            id_list = builder.select_output_format(fields=["id"])
            return Response(list(id_list), status=HTTP_200_OK)

        builder.apply_sorting().select_output_format().paginate()

        # Access the dynamic (Draft/)Activity serializer set during initialization
        serializer = builder.serializer_class(builder.query, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="csv")
    def csv(self, request, *args, **kwargs):
        """
        Export Endpoint for InvasivesBC Recordsets.

        Current functionality supports exporting any Recordset via, using the filters
        applied to the user's recordset. whether or not specified by the user, there is a subtype filter applied to all requests.
        This ensures common model entries don't get crossed. e.g.: Biocontrol Dispersal v Biocontrol Collections

        To change CSV Headers/Values/Formats, update :data:`CSV_EXPORT_ROW_MAP` classes
        """

        class Echo:
            """An object that implements write() to return the value
            instead of buffering it, allowing us to stream CSV rows."""

            def write(self, value):
                return value

        filter_objects = request.data.get("filterObjects", [])
        if not filter_objects:
            return Response("Missing filterObjects in payload", status=400)

        csv_type = filter_objects[0].get("CSVType")

        config_model = CSV_EXPORT_ROW_MAP.get(csv_type)
        if not config_model:
            return Response("Unsupported Activity Type", status=400)

        builder = FilteredActivityQueryset(filter_objects)
        builder.apply_filters().apply_sorting()
        activity_queryset = builder.query.filter(subtype=csv_type)

        valid_activity_ids = activity_queryset.values_list("id", flat=True).distinct()
        data_stream = (
            config_model.objects.filter(activity_id__id__in=valid_activity_ids)
            .values_list(*[entry["key"] for entry in config_model.csv_export_config])
            .iterator(chunk_size=2000)
        )

        def stream_rows():
            writer = csv.writer(Echo())
            yield writer.writerow(
                [entry["label"] for entry in config_model.csv_export_config]
            )
            for row in data_stream:
                yield writer.writerow(row)

        response = StreamingHttpResponse(stream_rows(), content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="{csv_type}_export.csv"'
        )
        return response
