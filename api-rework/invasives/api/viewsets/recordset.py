from api.constants import short_id_regex, uuid_regex
from api.models.activity import Activity
from api.permissions import HasAdminRole
from api.serializers.activity_recordset_row import (
  ActivityRecordsetRowSerializer,
  CachedActivityRecordsetRowSerializer,
)
from api.utils.filtered_activity_queryset import FilteredActivityQueryset
from django.contrib.gis.db.models.functions import AsGeoJSON, Centroid
from django.db.models import FilteredRelation, Q
from django.http import StreamingHttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
import logging

from silk.profiling.profiler import silk_profile

log = logging.getLogger("invasives")

CENTROID_ZOOM_LIMIT = 12


class RecordsetRowsViewSet(viewsets.GenericViewSet):
    serializer_class = ActivityRecordsetRowSerializer
    permission_classes = [HasAdminRole]

    @action(detail=False, methods=["POST"])
    @silk_profile()
    def experiment(self, request, *args, **kwargs):
        filter_objects = request.data.get("filterObjects", [])
        filter_helper = FilteredActivityQueryset(filter_objects=filter_objects)

        filter_helper.apply_sorting()

        filter_helper.select_output_format()
        base_queryset = filter_helper.query.annotate(
            centroid=AsGeoJSON(Centroid("shape"))
        )


        #
        # response = StreamingHttpResponse(
        #     data_generator(),
        #     content_type="application/x-ndjson",
        #     status=status.HTTP_200_OK,
        # )
        # response["X-Accel-Buffering"] = "no"

        return Response(CachedActivityRecordsetRowSerializer(base_queryset.all()[:200], many=True, read_only=True, context={"request": request}).data, status=status.HTTP_200_OK, content_type="application/x-ndjson",)

        # return response

    @action(detail=False, methods=["get"])
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
            id_list = FilteredActivityQueryset(
                filter_objects=filter_objects
            ).select_output_format(fields=["id"])
            return Response(list(id_list), status=status.HTTP_200_OK)
        records = (
            FilteredActivityQueryset(filter_objects=filter_objects)
            .apply_sorting()
            .select_output_format()
            .paginate()
        )
        serializer = self.get_serializer(records.query, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="csv")
    def csv(self, request, *args, **kwargs):
        """
        Export Endpoint for InvasivesBC Recordsets.

        Current functionality supports exporting any Recordset via, using the filters
        applied to the user's recordset. whether or not specified by the user, there is a subtype filter applied to all requests.
        This ensures common model entries don't get crossed. e.g.: Biocontrol Dispersal v Biocontrol Collections

        To change CSV Headers/Values/Formats, update :data:`CSV_SUBTYPE_CONFIG`
        """

        class Echo:
            """An object that implements write() to return the value
            instead of buffering it, allowing us to stream CSV rows."""

            def write(self, value):
                return value

        filter_objects = request.data.get("filterObjects", [])
        csv_type = filter_objects[0].get("CSVType")

        # Fetch Configuration for a specific 'Subtype'
        config = CSV_SUBTYPE_CONFIG.get(csv_type)

        if not config:
            return Response("Unsupported Activity Type", status=400)

        entry_model = config.get("entry_models")

        """
        Since CSV's are based on a Specific Subtype, ensure we are filtering for one. This eliminates
        Shared models like for Chemical/Mechanical Monitoring Records.
        """
        # Build up the base filtered/sorted query
        builder = (
            FilteredActivityQueryset(filter_objects).apply_filters().apply_sorting()
        )
        activity_queryset = builder.query.filter(subtype=csv_type)
        valid_activity_ids = activity_queryset.values_list("id", flat=True).distinct()

        ANNOTATIONS = build_csv_annotation_object(config.get("annotations", []))

        # Decompile the annotations Array into their respective sections
        annotations = {item["key"]: item["annotation"] for item in ANNOTATIONS}
        value_keys = [item["key"] for item in ANNOTATIONS]
        headers = [item["header"] for item in ANNOTATIONS]

        querysets = []

        for model in entry_model:
            qs = (
                model.objects.filter(
                    activity_data_record__activity_id__in=valid_activity_ids
                )
                .annotate(
                    root_activity=FilteredRelation("activity_data_record__activity")
                )
                .annotate(**annotations)
                .values(*value_keys)
                .distinct()
            )
            querysets.append(qs)

        if querysets:
            combined_query = querysets[0]
            for other_qs in querysets[1:]:
                combined_query = combined_query.union(other_qs)
            data_stream = combined_query.iterator(chunk_size=3000)
        else:
            data_stream = iter([])

        def rows():
            echo = Echo()
            writer = csv.writer(echo)
            yield writer.writerow(headers)

            for record in data_stream:
                yield writer.writerow([record.get(key, "") for key in value_keys])

        response = StreamingHttpResponse(rows(), content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="{csv_type}_export.csv"'
        )
        return response
