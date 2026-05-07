from django.contrib.gis.geos import GEOSGeometry
import json
import psycopg
import logging
import csv
from django.db.models.functions import Coalesce
from django.http import StreamingHttpResponse
from psycopg.rows import dict_row
from rest_framework.decorators import action
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.core.exceptions import FieldError
from django.db.models import (
    Q,
    F,
    Min,
    FilteredRelation,
)
from django.db.models.functions import Coalesce
from api.models.activity import ActivitySubtypes
from api.serializers.activity_recordset_row import (
    ActivityRecordsetRowSerializer,
    CachedActivityRecordsetRowSerializer,
)

from api.models.activity import Activity
from api.constants import uuid_regex, short_id_regex
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING
from api.configs.exports import build_csv_annotation_object, CSV_SUBTYPE_CONFIG
from api.models.activity import ActivitySubtypes

log = logging.getLogger("invasives")

# Separate complex paths to a constant for easier maintenance
ALL_PLANT_PATHS = [
    "activitydatarecord__aquaticplantobservationentry__invasive_plant__full",
    "activitydatarecord__terrestrialplantobservationentries__invasive_plant__full",
    "activitydatarecord__aquaticplantmechanicaltreatmententry__invasive_plant__full",
    "activitydatarecord__terrestrialplantmechanicaltreatmententry__invasive_plant__full",
    "activitydatarecord__terrestrialtreatmentmonitoringentry__invasive_plant__full",
    "activitydatarecord__terrestrialbiocontroldispersalmonitoringentry__invasive_plant__full",
    "activitydatarecord__terrestrialbiocontrolreleaseentry__invasive_plant__full",
    "activitydatarecord__aquatictreatmentmonitoringentry__invasive_plant__full",
    "activitydatarecord__chemicaltreatmentaquaticinvasiveplantrecord__invasive_plant__full",
    "activitydatarecord__chemicaltreatmentterrestrialinvasiveplantrecord__invasive_plant__full",
]
OBSERVATION_PLANTS_PATHS = ALL_PLANT_PATHS[:2]
TREATED_PLANTS_PATHS = ALL_PLANT_PATHS[2:]

BIOCONTROL_PATHS = [
    "activitydatarecord__terrestrialbiocontrolcollectionentry__biological_agent__full",
    "activitydatarecord__terrestrialbiocontrolreleaseentry__biocontrol_agent__full",
    "activitydatarecord__terrestrialbiocontroldispersalmonitoringentry__biocontrol_agent__full",
]

SORT_MAPPING = {
    "subtype": "subtype__readableFormat",
    "project_code": "activitydatarecord__projectcode__description",
    "agency": "activitydatarecord__fundingagency__agency__full",
    "jurisdiction_display": "activitydatarecord__jurisdiction__jurisdiction__full",
    "activity_id": "id",
    "activity_type": "type",
    "activity_subtype": "subtype",
    "activity_date": "date",
    "invasive_plant": "activitydatarecord__terrestrialplantobservationentries__invasive_plant__full",
    "regional_invasive_species_organization_areas": "computed_invasive_plant_management_areas",
    "regional_districts": "computed_regional_districts",
    "ownership": "computed_ownership",
    "moti_districts": "computed_moti_districts",
    "invasive_plant_management_areas": "computed_invasive_plant_management_areas",
    "biogeoclimatic_zones": "computed_biogeoclimatic_zone",
    "elevation": "computed_elevation_m",
    "updated_by": "created_by",
}


class RecordsetRowsViewSet(viewsets.GenericViewSet):
    serializer_class = ActivityRecordsetRowSerializer

    def get(self, request, *args, **kwargs):
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

    def create(self, request, *args, **kwargs):
        filter_objects = request.data.get("filterObjects", [])
        meta = filter_objects[0] if filter_objects else {}
        ids_only = (
            len(meta.get("selectColumns", [])) == 1
            and meta.get("selectColumns")[0] == "activity_id"
        )

        queryset = self._get_base_queryset()

        # 1. Apply Chained Filtering
        queryset = self._apply_filters(queryset, filter_objects)

        # 2. Apply Sorting & Annotations
        queryset, order_by = self._apply_sorting(queryset, meta)

        if ids_only:  # Early Return, just ship IDs, don't paginate.
            id_list = queryset.values_list("id", flat=True).distinct()
            return Response(list(id_list), status=status.HTTP_200_OK)

        # 3. Pagination & Execution
        results = self._paginate_and_execute(queryset, order_by, meta)

        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _apply_filters(self, queryset, filter_objects):
        """
        Processes filters. AND logic uses chained .filter() calls to ensure
        multiple related table lookups work correctly.
        """
        for obj in filter_objects:
            or_group = Q()
            ids_to_filter = obj.get("ids_to_filter", None)
            if ids_to_filter:
                uuids = []
                short_ids = []
                for id in ids_to_filter:
                    if uuid_regex.match(id):
                        uuids.append(id)
                    elif short_id_regex.match(id):
                        short_ids.append(id)
                queryset = queryset.filter(Q(id__in=uuids) | Q(short_id__in=short_ids))
            for f in obj.get("tableFilters", []):
                logic_gate = f.get("operator2", "AND")
                current_q = self._build_single_filter_q(f)

                if logic_gate == "OR":
                    or_group |= current_q
                else:
                    if or_group:
                        queryset = queryset.filter(or_group)
                        or_group = Q()
                    queryset = queryset.filter(current_q)
            if or_group:
                queryset = queryset.filter(or_group)

        return queryset

    def _build_single_filter_q(self, f):
        """Helper to create a Q object for a single filter row."""
        field = f.get("field", "").replace("activity_", "")
        value = f.get("filter")
        operator = f.get("operator")
        filter_type = f.get("filterType")

        if filter_type == "spatialFilterDrawn":
            try:
                geom_data = json.dumps(f.get("geojson").get("geometry"))
                search_geometry = GEOSGeometry(geom_data)
                return Q(shape__intersects=search_geometry)
            except Exception:
                log.error("Error while handling 'spatialFilterDrawn'", exc_info=True)
                return Q()
        elif filter_type == "spatialFilterUploaded":
            try:
                with psycopg.connect(
                    LEGACY_DB_CONNECTION_STRING, row_factory=dict_row
                ) as conn:
                    with conn.cursor() as cursor:
                        sql = """
                            SELECT geog
                            FROM admin_defined_shapes
                            WHERE id = %s
                            LIMIT 1;
                        """
                        cursor.execute(sql, (value,))
                        result = cursor.fetchone()
                        if result:
                            geog = result["geog"]
                            return Q(shape__intersects=GEOSGeometry(geog))
                        else:
                            log.debug(
                                f"Requested shape with ID '{value}' was not found."
                            )
                            return Q()
            except Exception:
                log.error("Error while handling 'spatialFilterUploaded'", exc_info=True)
                return Q()
        elif field == "invasive_plant":
            current_q = Q()
            for path in ALL_PLANT_PATHS:
                current_q |= Q(**{f"{path}__icontains": value})
        elif field == "species_biocontrol_full":
            current_q = Q()
            for path in BIOCONTROL_PATHS:
                current_q |= Q(**{f"{path}__icontains": value})
        elif field == "subtype":
            matching_enum_names = [
                member.name
                for member in ActivitySubtypes
                if value.lower() in member.readableFormat.lower()
            ]
            current_q = Q(subtype__in=matching_enum_names)
        else:
            db_path = SORT_MAPPING.get(field, field)
            current_q = Q(**{f"{db_path}__icontains": value})

        return ~current_q if operator == "DOES NOT CONTAIN" else current_q

    def _get_base_queryset(self):
        """Returns the queryset with all necessary prefetches."""
        return Activity.objects.all().prefetch_related(
            "activitydatarecord_set__jurisdiction_set__jurisdiction",
            "activitydatarecord_set__projectcode_set",
            "activitydatarecord_set__fundingagency_set__agency",
            "activitydatarecord_set__aquaticplantobservationentry_set__invasive_plant",
            "activitydatarecord_set__terrestrialplantobservationentries_set__invasive_plant",
            "activitydatarecord_set__aquaticplantmechanicaltreatmententry_set__invasive_plant",
            "activitydatarecord_set__terrestrialplantmechanicaltreatmententry_set__invasive_plant",
            "activitydatarecord_set__terrestrialbiocontroldispersalmonitoringentry_set__invasive_plant",
            "activitydatarecord_set__terrestrialbiocontrolreleaseentry_set__invasive_plant",
            "activitydatarecord_set__aquatictreatmentmonitoringentry_set__invasive_plant",
            "activitydatarecord_set__terrestrialtreatmentmonitoringentry_set__invasive_plant",
            "activitydatarecord_set__terrestrialbiocontrolcollectionentry_set__invasive_plant",
            "activitydatarecord_set__terrestrialbiocontrolcollectionentry_set__biological_agent",
            "activitydatarecord_set__terrestrialbiocontrolreleaseentry_set__biocontrol_agent",
            "activitydatarecord_set__terrestrialbiocontroldispersalmonitoringentry_set__biocontrol_agent",
            "activitydatarecord_set__terrestrialbiocontroldispersalmonitoringentry_set__invasive_plant",
        )

    def _build_filter_query(self, filter_objects):
        """Parses frontend filterObjects into a nested Django Q object."""
        final_query = Q()
        for obj in filter_objects:
            for f in obj.get("tableFilters", []):
                field = f.get("field", "").replace("activity_", "")
                value = f.get("filter")
                operator = f.get("operator")
                logic_gate = f.get("operator2", "AND")

                if field == "invasive_plant":
                    current_q = Q()
                    for path in ALL_PLANT_PATHS:
                        current_q |= Q(**{f"{path}__icontains": value})
                else:
                    db_path = SORT_MAPPING.get(field, field)
                    current_q = Q(**{f"{db_path}__icontains": value})

                if operator == "DOES NOT CONTAIN":
                    current_q = ~current_q

                final_query = (
                    (final_query | current_q)
                    if logic_gate == "OR"
                    else (final_query & current_q)
                )
        return final_query

    def _apply_sorting(self, queryset, meta):
        """Handles complex annotations and returns the (queryset, sort_field) tuple."""
        sort_column = meta.get("sortColumn", "date").replace("activity_", "")

        if sort_column in ["species_negative_full", "species_positive_full"]:
            obs_type = "Negative" if "negative" in sort_column else "Positive"
            condition = Q(type="Observation") & (
                Q(
                    activitydatarecord__terrestrialplantobservationentries__observation_type=obs_type
                )
                | Q(
                    activitydatarecord__aquaticplantobservationentry__observation_type=obs_type
                )
            )
            queryset = queryset.annotate(
                observation_species=Min(
                    Coalesce(OBSERVATION_PLANTS_PATHS), filter=condition
                )
            )
            return queryset, "observation_species"

        if sort_column == "invasive_plant":
            queryset = queryset.annotate(
                invasive_plant_sort=Coalesce(*[F(p) for p in ALL_PLANT_PATHS])
            )
            return queryset, "invasive_plant_sort"

        if sort_column == "species_treated":
            queryset = queryset.annotate(
                species_treated_sort=Coalesce(*[F(p) for p in [TREATED_PLANTS_PATHS]])
            )
            return queryset, "species_treated_sort"

        if sort_column == "species_biocontrol_full":
            queryset = queryset.annotate(
                species_biocontrol_full=Coalesce(*[F(p) for p in BIOCONTROL_PATHS])
            )
            return queryset, "species_biocontrol_full"

        return queryset, SORT_MAPPING.get(sort_column, sort_column)

    def _paginate_and_execute(self, queryset, order_by, meta):
        """Handles final ordering, distinct, and slicing."""
        page = int(meta.get("page", 0))
        limit = int(meta.get("limit", 10))
        direction = meta.get("sortOrder", "DESC")

        start, stop = page * limit, (page * limit) + limit

        try:
            order_expr = (
                F(order_by).asc(nulls_last=True)
                if direction == "ASC"
                else F(order_by).desc(nulls_last=True)
            )
            return queryset.order_by(order_expr).distinct()[start:stop]
        except FieldError:
            return queryset.order_by("-date").distinct()[start:stop]

    @action(detail=False, methods=["post"], url_path="csv")
    def csv(self, request, *args, **kwargs):
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

        entry_model = config.get("entry_model")

        # Get IDs matching Filters to apply to our model
        activity_queryset = self._get_base_queryset()
        activity_queryset = self._apply_filters(activity_queryset, filter_objects)
        valid_activity_ids = activity_queryset.values_list("id", flat=True).distinct()

        ANNOTATIONS = build_csv_annotation_object(config.get("annotations", []))

        # Decompile the annotations Array into their respective sections
        annotations = {item["key"]: item["annotation"] for item in ANNOTATIONS}
        value_keys = [item["key"] for item in ANNOTATIONS]
        headers = [item["header"] for item in ANNOTATIONS]

        data_stream = (
            # Use Entry model so rows are by Entries, not Records (1 plant, 1 row)
            entry_model.objects.filter(
                activity_data_record__activity_id__in=valid_activity_ids
            )
            .annotate(root_activity=FilteredRelation("activity_data_record__activity"))
            .annotate(**annotations)
            .values(*value_keys)
            .distinct()
            .iterator(chunk_size=1000)  # Chunk out for Streaming
        )

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
