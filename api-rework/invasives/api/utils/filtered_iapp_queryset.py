from django.contrib.gis.geos import GEOSGeometry
import json, psycopg, logging
from django.db.models import Exists, Q, CharField, Subquery, OuterRef
from django.db.models.functions import Cast
from enum import Enum
from psycopg.rows import dict_row
from django.core.exceptions import FieldError
from api.models.iapp import (
    IAPPSite,
    IAPPSiteSelection,
    IAPPBiologicalTreatment,
    IAPPBiologicalDispersal,
    IAPPBiologicalMonitoring,
    IAPPChemicalMonitoring,
    IAPPChemicalTreatment,
    IAPPMechanicalMonitoring,
    IAPPMechanicalTreatment,
)
from api.models.auth import User
from api.protocol.iapp import BIOCONTROL_ROLES
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING

log = logging.getLogger(__name__)

max_survey_subq = (
    IAPPSiteSelection.objects.filter(site_id=OuterRef("pk"))
    .order_by("-last_surveyed_date")
    .values("last_surveyed_date")[:1]
)


class Column(Enum):
    """Expected Columns that may be filtered on by end user"""

    SITE = "site_id"
    PAPER_FILE = "site_paper_file_id"
    JURISIDICTIONS = "jurisdictions_flattened"
    MIN_SURVEY = "min_survey"
    MAX_SURVEY = "max_survey"
    ALL_SPECIES = "all_species_on_site"
    BIO_AGENT = "biological_agent"
    AGENCIES = "agencies"
    HAS_BIO_TREATMENT = "has_biological_treatments"
    HAS_CHEM_TREATMENT = "has_chemical_treatments"
    HAS_MECH_TREATMENT = "has_mechanical_treatments"
    HAS_BIO_DISPERSAL = "has_biological_dispersals"
    HAS_MONITOR = "monitored"
    REGIONAL_DISTRICT = "regional_district"
    RISO = "regional_invasive_species_organization"
    IPMA = "invasive_plant_management_area"
    SHAPE = "geometry"


class FilteredIappQueryset:
    """Helper for querying IAPP across endpoints using incoming filterObjeccts"""

    PREFETCH = (
        "site_selections",
        "surveys",
        "mechanical_treatments",
        "mechanical_monitorings",
        "chemical_treatments",
        "chemical_monitorings",
        "biological_treatments",
        "biological_monitorings",
        "biological_dispersals",
    )

    def __init__(self, filter_objects=None, user: User = None):
        self.filter_objects = filter_objects or [{}]

        self.queryset = IAPPSite.objects.all().prefetch_related(*self.PREFETCH)
        if user and not user.has_any_role(list(BIOCONTROL_ROLES)):
            self.queryset = self.queryset.exclude(protected=True)

        self._is_filtered = False
        self._is_sorted = False

        self.apply_filters()
        self.apply_sorting()
        self.queryset = self.queryset.distinct("site_id")

    def _init_paths(self):
        self.SORT_MAPPING = {
            Column.SITE.value: "site_id",
            Column.PAPER_FILE.value: "iappsiteselection__site_paper_file_id",
            Column.JURISIDICTIONS.value: "iappsiteselection__jurisdictions",
            Column.MIN_SURVEY.value: "iappsiteselection__survey_date",
            Column.MAX_SURVEY.value: "iappsiteselection__survey_date",
            Column.ALL_SPECIES.value: "iappsiteselection__all_species_on_site",
            Column.AGENCIES.value: "iappsiteselection__survey_agency",
            Column.HAS_BIO_TREATMENT.value: "",
            Column.HAS_CHEM_TREATMENT.value: "",
            Column.HAS_MECH_TREATMENT.value: "",
            Column.HAS_BIO_DISPERSAL.value: "",
            Column.HAS_MONITOR.value: "",
            Column.REGIONAL_DISTRICT.value: "iappsiteselection__regional_district",
            Column.RISO.value: "iappsiteselection__regional_invasive_species_organization",
            Column.IPMA.value: "iappsiteselection__invasive_plant_management_area",
        }

        self.BIOLOGICAL_AGENT_PATHS = [
            "iappbiologicaldispersal__biological_agent",
            "iappbiologicalmonitoring__biological_agent",
            "iappbiologicaltreatment__biological_agent",
        ]

    def paginate(self, page=None, limit=None):
        meta = self.filter_objects[0] if self.filter_objects else {}
        target_page = int(page if page is not None else meta.get("page", 0))
        target_limit = int(limit if limit is not None else meta.get("limit", 10))

        start = target_page * target_limit
        self.queryset = self.queryset[start : start + target_limit]
        return self

        # Bridge functions to avoid needing to branch into queryset for endpoint specific functionality (Tiles)

    def apply_filters(self):
        def _handle_bool_yes_no(val: str, q: Exists, is_negation: bool):
            TRUTHY = {"y", "yes", "true", "t"}
            FALSEY = {"n", "no", "false", "f"}
            value = val.strip().lower()

            if not value:
                return Q()  # Invalid
            elif value in TRUTHY:
                res = q
            elif value in FALSEY:
                res = ~q
            else:
                return Q()  # Invalid
            return ~res if is_negation else res

        if self._is_filtered:
            return self

        self.is_filtered = True
        for obj in self.filter_objects:
            if raw_ids := obj.get("ids_to_filter", None):
                pass

            for f in obj.get("tableFilters", []):
                # Reusable OuterRef filter expr
                pk = {"site_id": OuterRef("pk")}

                field = f.get("field", "")
                val = f.get("filter", "")
                operator = f.get("operator", "CONTAINS")
                type = f.get("filterType")
                operator_two = f.get("operator2", "AND")

                negation = bool(operator in ["DOES NOT CONTAIN", "NOT CONTAINED IN"])

                if not val:
                    continue

                q = Q()
                match field:
                    case Column.SITE.value:
                        q = Q(site_id=val)
                        q = ~q if negation else q
                    case Column.PAPER_FILE.value:
                        q = Q(site_selections__site_paper_file_id__icontains=val)
                        if negation:
                            q = ~q & Q(
                                site_selections__site_paper_file_id__isnull=False
                            )
                    case Column.JURISIDICTIONS.value:
                        q = Q(site_selections__jurisdictions__icontains=val)
                        if negation:
                            q = ~q & Q(site_selections__jurisdictions__isnull=False)
                    case Column.MIN_SURVEY.value:
                        q = Q(site_selections__site_created_date__icontains=val)
                        if not negation:
                            q = ~q & Q(site_selections__site_created_date__isnull=False)
                    case Column.MAX_SURVEY.value:
                        if "latest_survey_date" not in self.queryset.query.annotations:
                            self.queryset = self.queryset.annotate(
                                most_recent_survey=Cast(
                                    Subquery(max_survey_subq), output_field=CharField()
                                )
                            )
                        q = Q(most_recent_survey__icontains=val)
                        if negation:
                            q = ~q & Q(most_recent_survey__isnull=False)
                    case Column.ALL_SPECIES.value:
                        q = Q(site_selections__all_species_on_site__icontains=val)
                        if negation:
                            q = ~q & Q(
                                site_selections__all_species_on_site__isnull=False
                            )
                    case Column.BIO_AGENT.value:
                        f = {
                            "biological_agent__icontains": val,
                            "biological_agent__isnull": False,
                            **pk,
                        }
                        bt_exists = Exists(IAPPBiologicalTreatment.objects.filter(**f))
                        bd_exists = Exists(IAPPBiologicalDispersal.objects.filter(**f))
                        bm_exists = Exists(IAPPBiologicalMonitoring.objects.filter(**f))

                        q = Q(bt_exists | bd_exists | bm_exists)
                        if negation:
                            q = ~q

                    case Column.AGENCIES.value:
                        q = Q(surveys__survey_agency__icontains=val)
                        if negation:
                            q = ~q & Q(surveys__survey_agency__isnull=False)
                    case Column.HAS_BIO_TREATMENT.value:
                        q = Q(Exists(IAPPBiologicalTreatment.objects.filter(**pk)))
                        q = _handle_bool_yes_no(val, q, negation)

                    case Column.HAS_CHEM_TREATMENT.value:
                        q = Q(Exists(IAPPChemicalTreatment.objects.filter(**pk)))
                        q = _handle_bool_yes_no(val, q, negation)

                    case Column.HAS_MECH_TREATMENT.value:
                        q = Q(Exists(IAPPMechanicalTreatment.objects.filter(**pk)))
                        q = _handle_bool_yes_no(val, q, negation)

                    case Column.HAS_BIO_DISPERSAL.value:
                        q = Q(Exists(IAPPBiologicalDispersal.objects.filter(**pk)))
                        q = _handle_bool_yes_no(val, q, negation)

                    case Column.HAS_MONITOR.value:
                        q = Q(Exists(IAPPBiologicalMonitoring.objects.filter(**pk)))
                        q |= Q(Exists(IAPPChemicalMonitoring.objects.filter(**pk)))
                        q |= Q(Exists(IAPPMechanicalMonitoring.objects.filter(**pk)))
                        q = _handle_bool_yes_no(val, q, negation)

                    case Column.REGIONAL_DISTRICT.value:
                        q = Q(site_selections__regional_district__icontains=val)
                        if negation:
                            q = ~q & Q(site_selections__regional_district__isnull=False)
                    case Column.RISO.value:
                        q = Q(
                            site_selections__regional_invasive_species_organization__icontains=val
                        )
                        if negation:
                            q = ~q & Q(
                                site_selections__regional_invasive_species_organization__isnull=False
                            )
                    case Column.IPMA.value:
                        q = Q(
                            site_selections__invasive_plant_management_area__icontains=val
                        )
                        if negation:
                            q = ~q & Q(
                                site_selections__invasive_plant_management_area__isnull=False
                            )
                self.queryset = self.queryset.filter(q)

        return self

    def apply_sorting(self):
        return self
        if self._is_sorted:
            return self
        # self.apply_filters()
        meta = self.filter_objects[0] if self.filter_objects else {}
        sort_column = meta.get("sortColumn", Column.SITE)
        dir = meta.get("sortOrder", "DESC")

        try:
            pass
        except FieldError as e:
            logging.error(f"ran into error when sorting query by {sort_column}")
            self.queryset = self.queryset.order_by(f"-{Column.SITE}")
        self._is_sorted = True
        return self

    def exists(self):
        return self.queryset.exists()

    def aexists(self):
        return self.queryset.aexists()

    def filter(self, *args, **kwargs):
        self.queryset = self.queryset.filter(*args, **kwargs)
        return self

    def annotate(self, *args, **kwargs):
        self.queryset = self.queryset.annotate(*args, **kwargs)
        return self

    def aggregate(self, *args, **kwargs):
        return self.queryset.aggregate(*args, **kwargs)

    def aaggregate(self, *args, **kwargs):
        return self.queryset.aaggregate(*args, **kwargs)

    def get(self, *args, **kwargs):
        return self.queryset.get(*args, **kwargs)

    def values(self, *args, **kwargs):
        self.queryset = self.queryset.values(*args, **kwargs)
        return self
