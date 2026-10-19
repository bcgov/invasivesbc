import logging
from ninja import Router, Query
from django.http import JsonResponse, StreamingHttpResponse
from rest_framework import status
from django.db import transaction
from api.utils.timezones import csv_value
from typing import List, Union, Annotated
from api.models.export.csv import CSV_EXPORT_ROW_MAP
import uuid, csv
from api.models.activity import Activity
from django.db.models import Q
from api.constants import short_id_regex, uuid_regex
from api.permissions.activity_access import filter_activities_by_access
from api.ninja_authentication import NinjaKeycloakAuthentication
from api.protocol.activity.activity_plant_summary_out import ActivityPlantSummaryOut
from . import FilterObjectsIn, IdListIn
from api.utils.filtered_activity_queryset import FilteredActivityQueryset
from api.protocol.activity.activity_plant_row_out import (
    ActivityPlantRowOut,
    CachedActivityPlantRowOut,
    DraftActivityPlantRowOut,
)

ROOT_PATH = "/recordset"
router = Router(auth=NinjaKeycloakAuthentication())
log = logging.getLogger(__name__)


@router.post(
    "/rows",
    response={
        200: List[DraftActivityPlantRowOut] | List[ActivityPlantRowOut] | List[str]
    },
)
def get_recordset_rows(request, data: FilterObjectsIn):
    filter_objects = (data.model_dump(mode="json", exclude_unset=True)).get(
        "filterObjects", []
    )
    meta = filter_objects[0] if filter_objects else {}
    ids_only = meta.get("selectColumns") == ["activity_id"]

    with transaction.atomic():
        builder: FilteredActivityQueryset = filter_activities_by_access(
            FilteredActivityQueryset(filter_objects=filter_objects), request.auth
        )
        if ids_only:  # Early Return, just ship IDs
            id_list = builder.select_output_format(fields=["id"])
            return [str(item) for item in id_list]

        builder.apply_sorting().select_output_format().paginate()

        return builder.query


@router.post("/csv", response={200: ActivityPlantSummaryOut})
def get_csv_export(request, data: FilterObjectsIn):
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

    with transaction.atomic():
        filter_objects = (data.model_dump(mode="json", exclude_unset=True)).get(
            "filterObjects"
        )
        csv_type = filter_objects[0].get("CSVType")

        config_model = CSV_EXPORT_ROW_MAP.get(csv_type)
        if not config_model:
            return JsonResponse({"details": "Unsupported Activity Type"}, status=400)

        builder: FilteredActivityQueryset = filter_activities_by_access(
            FilteredActivityQueryset(filter_objects), request.auth
        )
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
                yield writer.writerow([csv_value(v) for v in row])

        response = StreamingHttpResponse(stream_rows(), content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="{csv_type}_export.csv"'
        )
        return response


@router.get(
    "/cache",
    response={200: List[CachedActivityPlantRowOut], 400: dict},
)
def get_recordset_cache(request, query: Query[IdListIn]):
    """
    Given a 'idList' query param of IDs (short or full)
    return a list of Recordset rows and data payloads (For caching purposes)
    """
    uuids = []
    short_ids = []

    for id in query.idList:
        if uuid_regex.match(id):
            uuids.append(uuid.UUID(id))
        elif short_id_regex.match(id):
            short_ids.append(id)
        else:
            return JsonResponse(
                data={"details": f"Invalid ID: {id}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    with transaction.atomic():
        results = filter_activities_by_access(
            Activity.objects.filter(Q(id__in=uuids) | Q(short_id__in=short_ids)),
            request.auth,
        )
        return results
