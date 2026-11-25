from django.contrib.gis.geos import GEOSGeometry
import json, psycopg, logging
from django.db.models import F, Min, Q, When, Value, CharField, Case
from django.db.models.functions import Coalesce
from enum import Enum
from psycopg.rows import dict_row
from django.core.exceptions import FieldError
from api.models.iapp import IAPPSite
from api.models.auth import User
from api.protocol.iapp import BIOCONTROL_ROLES
from api.serializers.activity_recordset_row import (
    ActivityRecordsetRowSerializer,
    DraftActivityRecordsetRowSerializer,
)
from api.constants import uuid_regex, short_id_regex
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING

log = logging.getLogger(__name__)


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

    def __init__(self, filter_objects=None, user: User = None):
        self.filter_objects = filter_objects or [{}]

        self.queryset = IAPPSite.objects.all()
        if user and not user.has_any_role(list(BIOCONTROL_ROLES)):
            self.queryset = IAPPSite.objects.exclude(protected=True)

        self._is_filtered = False
        self._is_sorted = False

    def _init_paths(self):
        self.SORT_MAPPING = {
            Column.SITE.value: "site_id",
            Column.PAPER_FILE.value: "iappsiteselection__site_paper_file_id",
            Column.JURISIDICTIONS.value: "iappsiteselection__jurisdictions",
            Column.MIN_SURVEY.value: "iappsiteselection__survey_date",
            Column.MAX_SURVEY.value: "iappsiteselection__survey_date",
            Column.ALL_SPECIES.value: "iappsiteselection__all_species_on_site",
            Column.BIO_AGENT.value: "",
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
