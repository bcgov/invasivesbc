from django.contrib.gis.geos import GEOSGeometry
import json, psycopg, logging
from django.db.models import F, Min, Q, When, Value, CharField, Case
from django.db.models.functions import Coalesce
from enum import Enum
from psycopg.rows import dict_row
from django.core.exceptions import FieldError
from api.models.activity import (
    ActivitySubtypes,
    Activity,
    DraftActivity,
    ActivityType,
)
from api.serializers.activity_recordset_row import (
    ActivityRecordsetRowSerializer,
    DraftActivityRecordsetRowSerializer,
)
from api.constants import uuid_regex, short_id_regex
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING

log = logging.getLogger(__name__)


class Column(Enum):
    """Expected Columns that may be filtered on by end user"""

    SUBTYPE = "subtype"
    ACTIVITY_SUBTYPE = "activity_subtype"
    PROJECT_CODE = "project_code"
    FUNDING_AGENCY = "agency"
    JURISDICTION = "jurisdiction_display"
    ID = "activity_id"
    SHORT_ID = "short_id"
    TYPE = "activity_type"
    ACTIVITY_DATE = "activity_date"
    RISOS = "regional_invasive_species_organization_areas"
    DISTRICTS = "regional_districts"
    OWNERSHIP = "ownership"
    MOTI = "moti_districts"
    IPMA = "invasive_plant_management_areas"
    BIO_ZONE = "biogeoclimatic_zones"
    ELEVATION = "elevation"
    UPDATED_BY = "updated_by"
    NEGATIVE_PLANT = "species_negative_full"
    POSITIVE_PLANT = "species_positive_full"
    TREATED_PLANT = "species_treated_full"
    PLANT = "invasive_plant"
    BIOCONTROL_AGENT = "species_biocontrol_full"


class FilteredActivityQueryset:
    """Helper for querying Activities across endpoints using incoming 'filterObjects'"""

    def __init__(self, filter_objects=None, draft_override: bool = False):
        self.filter_objects = filter_objects or [{}]
        meta = self.filter_objects[0]

        # Determine draft status up front
        self.should_filter_drafts = any(
            f.get("field") == "form_status" for f in meta.get("tableFilters", [])
        )
        self.prefix = "draft" if self.should_filter_drafts else ""
        self.root = self.prefix + "activitydatarecord"

        if self.should_filter_drafts or draft_override:
            # TODO: Pre-filter Draft Activities to only be by requesting user.
            self.model = DraftActivity
            self.queryset = DraftActivity.objects.all()
        else:
            self.model = Activity
            self.queryset = Activity.objects.all()

        self._is_filtered = False
        self._is_sorted = False

        # Initialize Paths mapping to avoid rebuilding dynamically
        self._init_paths()

        self.serializer_class = (
            DraftActivityRecordsetRowSerializer
            if self.should_filter_drafts
            else ActivityRecordsetRowSerializer
        )

    def _init_paths(self):
        """
        Dynamically create the paths necessary for filtering.
        Handles
        """
        leading_set = f"{self.root}_set__{self.prefix}"
        leading = f"{self.root}__{self.prefix}"
        self.leading = leading

        self.SORT_MAPPING = {
            Column.SUBTYPE.value: "subtype",
            Column.ACTIVITY_SUBTYPE.value: "subtype",
            Column.PROJECT_CODE.value: f"{leading}projectcode__description",
            Column.FUNDING_AGENCY.value: f"{leading}fundingagency__agency__full",
            Column.JURISDICTION.value: f"{leading}jurisdiction__jurisdiction__full",
            Column.ID.value: "id",
            Column.TYPE.value: "type",
            Column.ACTIVITY_DATE.value: "date",
            Column.RISOS.value: f"{leading}risoarea__organization",
            Column.DISTRICTS.value: "computed_regional_districts",
            Column.OWNERSHIP.value: "computed_ownership",
            Column.MOTI.value: "computed_moti_districts",
            Column.IPMA.value: "computed_invasive_plant_management_areas",
            Column.BIO_ZONE.value: "computed_biogeoclimatic_zone",
            Column.ELEVATION.value: "computed_elevation_m",
            Column.UPDATED_BY.value: "created_by",
        }

        # Paths where an invasive plant record will be found
        plant_column = "invasive_plant"
        self.ALL_PLANT_PATHS = [
            f"{leading}aquaticplantobservationentry__{plant_column}",
            f"{leading}terrestrialplantobservationentries__{plant_column}",
            f"{leading}aquaticplantmechanicaltreatmententry__{plant_column}",
            f"{leading}terrestrialplantmechanicaltreatmententry__{plant_column}",
            f"{leading}terrestrialtreatmentmonitoringentry__{plant_column}",
            f"{leading}terrestrialbiocontroldispersalmonitoringentry__{plant_column}",
            f"{leading}terrestrialbiocontrolreleaseentry__{plant_column}",
            f"{leading}aquatictreatmentmonitoringentry__{plant_column}",
            f"{leading}terrestrialbiocontrolcollectionentry__{plant_column}",
            f"{leading}terrestrialbiocontrolreleaseentry__{plant_column}",
            f"{leading}chemplantentryaquatic__{plant_column}",
            f"{leading}chemplantentryterrestrial__{plant_column}",
        ]

        # All Non-Observations are Treatments.
        self.TREATMENT_PATHS = self.ALL_PLANT_PATHS[2:]

        # Paths where a Biocontrol Agents will be found
        self.BIOCONTROL_PATHS = [
            f"{leading}terrestrialbiocontrolcollectionentry__biological_agent__full",
            f"{leading}terrestrialbiocontrolreleaseentry__biocontrol_agent__full",
            f"{leading}terrestrialbiocontroldispersalmonitoringentry__biocontrol_agent__full",
        ]

        self.BASE_PREFETCH = [
            f"{leading_set}jurisdiction_set__jurisdiction",
            f"{leading_set}projectcode_set",
            f"{leading_set}fundingagency_set__agency",
            *[
                f"{self.root}_set__{path.split('__')[-2]}_set__invasive_plant"
                for path in self.ALL_PLANT_PATHS
            ],
        ]

    def __iter__(self):
        return iter(self.queryset)

    @property
    def query(self):
        return self.queryset

    def apply_filters(self):
        if self._is_filtered:
            return self

        for obj in self.filter_objects:
            ids_to_filter = obj.get("ids_to_filter")
            if ids_to_filter:
                uuids = [id for id in ids_to_filter if uuid_regex.match(id)]
                short_ids = [id for id in ids_to_filter if short_id_regex.match(id)]
                self.queryset = self.queryset.filter(
                    Q(id__in=uuids) | Q(short_id__in=short_ids)
                )

            or_group = Q()
            for f in obj.get("tableFilters", []):
                current_q = self._build_single_filter_q(f)
                if f.get("operator2") == "OR":
                    or_group |= current_q
                else:
                    if or_group:
                        self.queryset = self.queryset.filter(or_group)
                        or_group = Q()
                    self.queryset = self.queryset.filter(current_q)
            if or_group:
                self.queryset = self.queryset.filter(or_group)

        # Collapse duplicates caused by ORM filter joins.
        self.queryset = self.queryset.distinct()
        self._is_filtered = True
        return self

    def select_output_format(self, fields=None):
        """
        Adjust the response of the Queryset if needed (E.g.: User only wants list of IDs)
        """
        self.apply_filters()
        self.queryset = self.queryset.prefetch_related(*self.BASE_PREFETCH)
        if fields:
            if len(fields) == 1:
                return self.queryset.values_list(fields[0], flat=True)
            return self.queryset.values_list(*fields)
        return self

    def apply_sorting(self):
        """
        Apply sorting to active Queryset. As many recordset columns are computed on the fly,
        create special annotations for the chosen column if necessary.
        """
        if self._is_sorted:
            return self

        self.apply_filters()
        meta = self.filter_objects[0] if self.filter_objects else {}
        sort_column = meta.get("sortColumn", Column.ACTIVITY_DATE.value).replace(
            "activity_",
            "",  # Cull leading activity_ as is not used in backend any longer
        )
        direction = meta.get("sortOrder", "DESC")

        if sort_column in [Column.POSITIVE_PLANT.value, Column.NEGATIVE_PLANT.value]:
            obs_type = "Negative" if "negative" in sort_column else "Positive"
            condition = Q(type=ActivityType.Observation.value) & (
                Q(
                    **{
                        f"{self.leading}terrestrialplantobservationentries__observation_type": obs_type
                    }
                )
                | Q(
                    **{
                        f"{self.leading}aquaticplantobservationentry__observation_type": obs_type
                    }
                )
            )
            self.queryset = self.queryset.annotate(
                observation_species=Min(
                    Coalesce(*[F(path) for path in self.ALL_PLANT_PATHS[:2]]),
                    filter=condition,
                )
            )
            order_by_field = "observation_species"

        elif sort_column == Column.SUBTYPE.value:
            when_conditions = [
                When(subtype=member.name, then=Value(member.readableFormat))
                for member in ActivitySubtypes
            ]

            self.queryset = self.queryset.annotate(
                subtype_readable=Case(
                    *when_conditions, default=F("subtype"), output_field=CharField()
                )
            )
            order_by_field = "subtype_readable"

        elif sort_column == Column.PLANT.value:
            self.queryset = self.queryset.annotate(
                invasive_plant_sort=Min(
                    Coalesce(*[F(f"{path}__full") for path in self.ALL_PLANT_PATHS])
                )
            )
            order_by_field = "invasive_plant_sort"

        elif sort_column == Column.TREATED_PLANT.value:
            self.queryset = self.queryset.annotate(
                species_treated_sort=Min(
                    Coalesce(*[F(path) for path in self.ALL_PLANT_PATHS[2:]])
                )
            )
            order_by_field = "species_treated_sort"

        elif sort_column == Column.BIOCONTROL_AGENT.value:
            self.queryset = self.queryset.annotate(
                species_biocontrol_full=Min(
                    Coalesce(*[F(path) for path in self.BIOCONTROL_PATHS])
                )
            )
            order_by_field = "species_biocontrol_full"

        elif sort_column in [
            Column.PROJECT_CODE.value,
            Column.FUNDING_AGENCY.value,
            Column.JURISDICTION.value,
            Column.RISOS.value,
        ]:
            # Remaining 1:M Fields, Wrap in Min() To remove Duplicate Entries when sorted on.
            raw_db_path = self.SORT_MAPPING.get(sort_column)
            order_by_field = f"{sort_column}_sort"
            self.queryset = self.queryset.annotate(**{order_by_field: Min(raw_db_path)})

        else:
            # Regular 1:1 Fields, no need for special annotations
            order_by_field = self.SORT_MAPPING.get(sort_column, sort_column)

        try:
            order_expr = (
                F(order_by_field).asc(nulls_last=True)
                if direction == "ASC"
                else F(order_by_field).desc(nulls_last=True)
            )
            self.queryset = self.queryset.order_by(order_expr)

        except FieldError as e:
            draft = "Draft" if self.should_filter_drafts else ""
            logging.error(
                f"Ran into error when sorting query by {order_by_field} on {draft}Activity Recordset: {e}"
            )
            self.queryset = self.queryset.order_by("-date")

        self._is_sorted = True
        return self

    def paginate(self, page=None, limit=None):
        meta = self.filter_objects[0] if self.filter_objects else {}
        target_page = int(page if page is not None else meta.get("page", 0))
        target_limit = int(limit if limit is not None else meta.get("limit", 10))

        start = target_page * target_limit
        self.queryset = self.queryset[start : start + target_limit]
        return self

    def _build_single_filter_q(self, f):
        field = f.get("field", "").replace("activity_", "")
        value = f.get("filter")
        operator = f.get("operator")
        filter_type = f.get("filterType")
        one_to_many_relations = [
            "project_code",
            "jurisdiction_display",
            "invasive_plant",
            "species_positive_full",
            "species_negative_full",
            "has_current_positive",
            "has_current_negative",
            "species_treated_full",
            "species_biocontrol_full",
            "agency",
            "regional_invasive_species_organization_areas",
        ]
        if filter_type == "mostRecentObservation":
            return Q()

        elif filter_type == "spatialFilterDrawn":
            try:
                return Q(
                    shape__intersects=GEOSGeometry(
                        json.dumps(f.get("geojson", {}).get("geometry"))
                    )
                )
            except Exception:
                log.error("Error while handling 'spatialFilterDrawn'", exc_info=True)
                return Q()

        elif filter_type == "spatialFilterUploaded":
            try:
                with psycopg.connect(
                    LEGACY_DB_CONNECTION_STRING, row_factory=dict_row
                ) as conn:
                    with conn.cursor() as cursor:
                        cursor.execute(
                            "SELECT geog FROM admin_defined_shapes WHERE id = %s LIMIT 1;",
                            (value,),
                        )
                        result = cursor.fetchone()
                        return (
                            Q(shape__intersects=GEOSGeometry(result["geog"]))
                            if result
                            else Q()
                        )
            except Exception:
                log.error("Error while handling 'spatialFilterUploaded'", exc_info=True)
                return Q()

        if field == Column.PLANT.value:
            current_q = Q()
            for path in self.ALL_PLANT_PATHS:
                current_q |= Q(**{f"{path}__full__icontains": value})

        elif field == Column.TREATED_PLANT.value:
            current_q = Q()
            for path in self.ALL_PLANT_PATHS[2:]:
                current_q |= Q(**{f"{path}__full__icontains": value})

        elif field in [Column.POSITIVE_PLANT.value, Column.NEGATIVE_PLANT.value]:
            obs_type = "Negative" if "negative" in field else "Positive"
            type_condition = Q(type=ActivityType.Observation.value) & (
                Q(
                    **{
                        f"{self.leading}terrestrialplantobservationentries__observation_type": obs_type
                    }
                )
                | Q(
                    **{
                        f"{self.leading}aquaticplantobservationentry__observation_type": obs_type
                    }
                )
            )
            search_q = Q()
            for path in self.ALL_PLANT_PATHS[:2]:
                search_q |= Q(**{f"{path}__full__icontains": value})
            current_q = type_condition & search_q

        elif field == Column.BIOCONTROL_AGENT.value:
            current_q = Q()
            for path in self.BIOCONTROL_PATHS:
                current_q |= Q(**{f"{path}__icontains": value})

        elif field == Column.SUBTYPE.value:
            matching_enum_names = [
                m.name
                for m in ActivitySubtypes
                if value.lower() in m.readableFormat.lower()
            ]
            current_q = Q(subtype__in=matching_enum_names)

        else:
            db_path = self.SORT_MAPPING.get(field, field)
            current_q = Q(**{f"{db_path}__icontains": value})

        if operator == "DOES NOT CONTAIN":
            if field in one_to_many_relations:
                matching_ids = self.model.objects.filter(current_q).values("id")
                return ~Q(pk__in=matching_ids)
            return ~current_q
        return current_q

    # Bridge functions to avoid needing to branch into queryset for endpoint specific functionality (Tiles)
    def exists(self):
        return self.queryset.exists()

    def filter(self, *args, **kwargs):
        self.queryset = self.queryset.filter(*args, **kwargs)
        return self

    def annotate(self, *args, **kwargs):
        self.queryset = self.queryset.annotate(*args, **kwargs)
        return self

    def aggregate(self, *args, **kwargs):
        return self.queryset.aggregate(*args, **kwargs)

    def get(self, *args, **kwargs):
        return self.queryset.get(*args, **kwargs)

    def values(self, *args, **kwargs):
        self.queryset = self.queryset.values(*args, **kwargs)
        return self
