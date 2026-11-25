from django.contrib.gis.geos import GEOSGeometry
import json, psycopg, logging
from django.db.models import F, Min, Q, When, Value, CharField, Case
from django.db.models.functions import Coalesce
from enum import Enum
from psycopg.rows import dict_row
from django.core.exceptions import FieldError
from api.models.iapp import IAPPSite
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


class FilteredActivityQueryset:
    """Helper for querying IAPP across endpoints using incoming filterObjeccts"""

    def __init__(self, filter_objects=None):
        self.filter_objects = filter_objects or [{}]
        self.root = self.prefix + "activitydatarecord"

        self.queryset = IAPPSite.objects.all()

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
