from django.contrib.gis.geos import GEOSGeometry
import json, psycopg, logging
from django.db.models import (
    F,
    Min,
    Q,
)
from django.db.models.functions import Coalesce
from psycopg.rows import dict_row
from django.core.exceptions import FieldError
from api.models.activity import ActivitySubtypes, Activity
from api.constants import uuid_regex, short_id_regex
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING

log = logging.getLogger("invasives")

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
    "regional_invasive_species_organization_areas": "activitydatarecord__risoarea__organization",
    "regional_districts": "computed_regional_districts",
    "ownership": "computed_ownership",
    "moti_districts": "computed_moti_districts",
    "invasive_plant_management_areas": "computed_invasive_plant_management_areas",
    "biogeoclimatic_zones": "computed_biogeoclimatic_zone",
    "elevation": "computed_elevation_m",
    "updated_by": "created_by",
}


class FilteredActivityQueryset:
    """
    Helper for querying Activities across endpoints using incoming 'filterObjects'
    """

    def __init__(self, filter_objects):
        self.filter_objects = filter_objects
        self.queryset = Activity.objects.all().prefetch_related(
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

    def apply_filters(self):
        """
        Processes filters. AND logic uses chained .filter() calls to ensure
        multiple related table lookups work correctly.
        """

        for obj in self.filter_objects:
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
                self.queryset = self.queryset.filter(
                    Q(id__in=uuids) | Q(short_id__in=short_ids)
                )
            for f in obj.get("tableFilters", []):
                logic_gate = f.get("operator2", "AND")
                current_q = self._build_single_filter_q(f)

                if logic_gate == "OR":
                    or_group |= current_q
                else:
                    if or_group:
                        self.queryset = self.queryset.filter(or_group)
                        or_group = Q()
                    self.queryset = self.queryset.filter(current_q)
            if or_group:
                self.queryset = self.queryset.filter(or_group)

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

    def _apply_sorting(self):
        meta = self.filter_objects[0] if self.filter_objects else {}
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
            # Fixed: Map items to F() expressions and unpack with *
            self.queryset = self.queryset.annotate(
                observation_species=Min(
                    Coalesce(*[F(p) for p in OBSERVATION_PLANTS_PATHS]),
                    filter=condition,
                )
            )
            return "observation_species"

        if sort_column == "invasive_plant":
            self.queryset = self.queryset.annotate(
                invasive_plant_sort=Coalesce(*[F(p) for p in ALL_PLANT_PATHS])
            )
            return "invasive_plant_sort"

        if sort_column == "species_treated":
            # Fixed: Removed the redundant nested bracket [] wrap around TREATED_PLANTS_PATHS
            self.queryset = self.queryset.annotate(
                species_treated_sort=Coalesce(*[F(p) for p in TREATED_PLANTS_PATHS])
            )
            return "species_treated_sort"

        if sort_column == "species_biocontrol_full":
            self.queryset = self.queryset.annotate(
                species_biocontrol_full=Coalesce(*[F(p) for p in BIOCONTROL_PATHS])
            )
            return "species_biocontrol_full"

        return SORT_MAPPING.get(sort_column, sort_column)

    def _paginate_and_execute(self, order_by):
        """Handles final ordering, distinct, and slicing."""
        meta = self.filter_objects[0] if self.filter_objects else {}
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
            self.queryset = self.queryset.order_by(order_expr).distinct()[start:stop]
        except FieldError:
            self.queryset = self.queryset.order_by("-date").distinct()[start:stop]

        return self

    def query(self, ids_only=False, paginate=False):
        self.apply_filters()
        order_by = self._apply_sorting()
        if ids_only:
            self.queryset = self.queryset.values_list("id", flat=True).distinct()
        if paginate:
            self._paginate_and_execute(order_by)
        return self.queryset
