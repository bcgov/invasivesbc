import csv
import logging

from api.configs.exports import CSV_SUBTYPE_CONFIG, build_csv_annotation_object
from api.constants import short_id_regex, uuid_regex
from api.models.activity import Activity, ActivitySubtypes
from api.permissions import HasAdminRole
from api.serializers.activity_recordset_row import (
    ActivityRecordsetRowSerializer,
    CachedActivityRecordsetRowSerializer,
)
from api.utils.filtered_activity_queryset import FilteredActivityQueryset
from api.viewsets.mixins.atomic import AtomicViewSetMixin
from asgiref.sync import sync_to_async
from django.db.models import FilteredRelation, Q
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
        builder = FilteredActivityQueryset(filter_objects)

        builder.apply_filters().apply_sorting()
        activity_queryset = builder.query.filter(subtype=csv_type)

        valid_activity_ids = activity_queryset.values_list("id", flat=True).distinct()
        is_chemical_treatment = csv_type in [
            ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name,
            ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name,
        ]
        ANNOTATIONS = build_csv_annotation_object(
            config.get("annotations", []), is_chemical_treatment=is_chemical_treatment
        )

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
            data_stream = combined_query.iterator(chunk_size=1500)
        else:
            data_stream = iter([])

        async def async_rows():
            echo = Echo()
            writer = csv.writer(echo)
            yield writer.writerow(headers)

            get_next_record = sync_to_async(
                lambda: next(data_stream, None), thread_sensitive=True
            )
            while True:
                record = await get_next_record()
                if record is None:
                    break
                yield writer.writerow([record.get(key, "") for key in value_keys])

        response = StreamingHttpResponse(async_rows(), content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="{csv_type}_export.csv"'
        )
        return response
