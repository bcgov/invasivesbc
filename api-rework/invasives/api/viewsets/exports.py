import logging, csv
from django.db.models import (
    FilteredRelation,
)
from django.http import StreamingHttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from api.configs.exports import build_csv_annotation_object, CSV_SUBTYPE_CONFIG
from api.utils.filtered_activity_queryset import FilteredActivityQueryset

log = logging.getLogger("invasives")


class ExportViewset(viewsets.GenericViewSet):

    @action(detail=False, methods=["post"], url_path="csv")
    def recordset_csv(self, request, *args, **kwargs):
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
        activity_queryset = FilteredActivityQueryset(
            filter_objects=filter_objects
        ).query()
        activity_queryset = activity_queryset.filter(subtype=csv_type)
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
