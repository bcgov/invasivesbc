import logging
from django.db.models import (
    Exists,
    Q,
    F,
    CharField,
    Subquery,
    OuterRef,
    QuerySet,
    When,
    Value,
    Case,
    BooleanField,
)
from enum import Enum
from django.db.models.functions import Greatest, Least, Trim
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
    IAPPSurvey,
)
from api.models.auth import User
from api.protocol.iapp import BIOCONTROL_ROLES

log = logging.getLogger(__name__)


def build_simple_subq(
    model,
    key: str = None,
    is_str: bool = True,
    min: bool = False,
    max: bool = False,
    exists: bool = False,
):
    base_q = model.objects.filter(site_id=OuterRef("pk"))

    if exists:
        return Exists(base_q)
    if not key:
        raise ValueError("No key defined")
    base_q = base_q.filter(**{f"{key}__isnull": False})

    if is_str:
        base_q = (
            base_q.annotate(_trimmed=Trim(F(key)))
            .exclude(_trimmed__isnull=True)
            .exclude(_trimmed="")
        )

    if min:
        base_q = base_q.order_by(key)
    elif max:
        base_q = base_q.order_by(f"-{key}")

    value = "_trimmed" if is_str else key
    return Subquery(base_q.values(value)[:1])


has_bio_treatment_subq = build_simple_subq(model=IAPPBiologicalTreatment, exists=True)
has_chemical_treatment = build_simple_subq(model=IAPPChemicalTreatment, exists=True)
has_mech_treatment = build_simple_subq(model=IAPPMechanicalTreatment, exists=True)
has_bio_dispersal_subq = build_simple_subq(IAPPBiologicalDispersal, exists=True)
has_chem_monitor = build_simple_subq(IAPPChemicalMonitoring, exists=True)

has_chem_monitor = build_simple_subq(IAPPChemicalMonitoring, exists=True)
has_bio_monitor = build_simple_subq(IAPPBiologicalMonitoring, exists=True)
has_mech_monitor = build_simple_subq(IAPPMechanicalMonitoring, exists=True)
has_monitoring_subq = Case(
    When(has_chem_monitor | has_mech_monitor | has_bio_monitor, then=Value(True)),
    default=Value(False),
    output_field=BooleanField(),
)
most_recent_survey_subq = build_simple_subq(
    IAPPSiteSelection, key="last_surveyed_date", min=True, is_str=False
)
site_created_date_subq = build_simple_subq(
    IAPPSiteSelection, key="site_created_date", max=True, is_str=False
)
max_plant_subq = build_simple_subq(
    IAPPSiteSelection, key="all_species_on_site", max=True
)
min_plant_subq = build_simple_subq(
    IAPPSiteSelection, key="all_species_on_site", min=True
)
min_site_paper_file_subq = build_simple_subq(
    IAPPSiteSelection, key="site_paper_file_id", min=True
)
max_site_paper_file_subq = build_simple_subq(
    IAPPSiteSelection, key="site_paper_file_id", max=True
)
min_jurisdiction_subq = build_simple_subq(
    IAPPSiteSelection, key="jurisdictions", min=True
)
max_jurisdiction_subq = build_simple_subq(
    IAPPSiteSelection, key="jurisdictions", max=True
)
max_agencies_subq = build_simple_subq(IAPPSurvey, key="survey_agency", max=True)
min_agencies_subq = build_simple_subq(IAPPSurvey, key="survey_agency", min=True)
min_districts_subq = build_simple_subq(
    IAPPSiteSelection, key="regional_district", min=True
)
max_districts_subq = build_simple_subq(
    IAPPSiteSelection, key="regional_district", max=True
)
min_ipma_subq = build_simple_subq(
    IAPPSiteSelection, key="invasive_plant_management_area", min=True
)
max_ipma_subq = build_simple_subq(
    IAPPSiteSelection, key="invasive_plant_management_area", max=True
)
min_riso_subq = build_simple_subq(
    IAPPSiteSelection, key="regional_invasive_species_organization", min=True
)
max_riso_subq = build_simple_subq(
    IAPPSiteSelection, key="regional_invasive_species_organization", max=True
)

max_bio_mon = build_simple_subq(
    IAPPBiologicalMonitoring, key="biological_agent", max=True
)
max_bio_disp = build_simple_subq(
    IAPPBiologicalDispersal, key="biological_agent", max=True
)
max_bio_treat = build_simple_subq(
    IAPPBiologicalTreatment, key="biological_agent", max=True
)

max_biocontrol_subq = ""
min_bio_mon = build_simple_subq(
    IAPPBiologicalMonitoring, key="biological_agent", max=True
)
min_bio_disp = build_simple_subq(
    IAPPBiologicalDispersal, key="biological_agent", max=True
)
min_bio_treat = build_simple_subq(
    IAPPBiologicalTreatment, key="biological_agent", max=True
)
BIO_MODELS = {
    IAPPBiologicalTreatment,
    IAPPBiologicalDispersal,
    IAPPBiologicalMonitoring,
}
min_biocontrol_subq = Least(
    *[build_simple_subq(m, key="biological_agent", min=True) for m in BIO_MODELS]
)
max_biocontrol_subq = Greatest(
    *[build_simple_subq(m, key="biological_agent", max=True) for m in BIO_MODELS]
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

    def guarded_annotation(
        self, annotation: str, query: QuerySet, output_field=CharField
    ):
        """Prevent Annotations overwriting other annotations causing more querying."""
        if annotation not in self.queryset.query.annotations:
            kwargs = {}
            if output_field is not None:
                kwargs["output_field"] = (
                    output_field() if isinstance(output_field, type) else output_field
                )
            # Only wrap in Cast when a cast is actually needed
            self.annotate(**{annotation: query})

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
                        self.guarded_annotation(
                            "most_recent_survey", most_recent_survey_subq
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
        if self._is_sorted:
            return self
        # self.apply_filters()
        meta = self.filter_objects[0] if self.filter_objects else {}
        sort_column = meta.get("sortColumn", Column.SITE.value)
        is_order_asc = meta.get("sortOrder", "ASC") == "ASC"

        order_by = None
        try:
            match sort_column:
                case Column.SITE.value:
                    order_by = Column.SITE.value
                case Column.PAPER_FILE.value:
                    if is_order_asc:
                        order_by = "min_paper_file"
                        self.guarded_annotation(order_by, min_site_paper_file_subq)
                    else:
                        order_by = "max_paper_file"
                        self.guarded_annotation(order_by, max_site_paper_file_subq)
                case Column.JURISIDICTIONS.value:
                    if is_order_asc:
                        order_by = "min_jurisdictions"
                        self.guarded_annotation(order_by, min_jurisdiction_subq)
                    else:
                        order_by = "max_jurisdictions"
                        self.guarded_annotation(order_by, max_jurisdiction_subq)
                case Column.MIN_SURVEY.value:
                    order_by = "site_created_date"
                    self.guarded_annotation(order_by, site_created_date_subq)
                case Column.MAX_SURVEY.value:
                    order_by = "most_recent_survey"
                    self.guarded_annotation(order_by, most_recent_survey_subq)
                case Column.ALL_SPECIES.value:
                    if is_order_asc:
                        order_by = "min_plant"
                        self.guarded_annotation(order_by, min_plant_subq)
                    else:
                        order_by = "max_plant"
                        self.guarded_annotation(order_by, max_plant_subq)
                case Column.BIO_AGENT.value:
                    if is_order_asc:
                        order_by = "min_agent"
                        self.guarded_annotation(order_by, min_biocontrol_subq)
                    else:
                        order_by = "max_agent"
                        self.guarded_annotation(order_by, max_biocontrol_subq)
                case Column.AGENCIES.value:
                    if is_order_asc:
                        order_by = "min_agency"
                        self.guarded_annotation(order_by, min_agencies_subq)
                    else:
                        order_by = "max_agency"
                        self.guarded_annotation(order_by, max_agencies_subq)
                case Column.HAS_BIO_TREATMENT.value:
                    order_by = "has_biocontrol_treatment"
                    self.guarded_annotation(order_by, has_bio_treatment_subq, None)
                case Column.HAS_CHEM_TREATMENT.value:
                    order_by = "has_chemical_treatment"
                    self.guarded_annotation(order_by, has_chemical_treatment, None)
                case Column.HAS_MECH_TREATMENT.value:
                    order_by = "has_mechanical_treatment"
                    self.guarded_annotation(order_by, has_mech_treatment, None)
                case Column.HAS_BIO_DISPERSAL.value:
                    order_by = "has_bio_dispersal"
                    self.guarded_annotation(order_by, has_bio_dispersal_subq, None)
                case Column.HAS_MONITOR.value:
                    order_by = "has_monitoring"
                    self.guarded_annotation(order_by, has_monitoring_subq, None)
                case Column.REGIONAL_DISTRICT.value:
                    if is_order_asc:
                        order_by = "min_district"
                        self.guarded_annotation(order_by, min_districts_subq)
                    else:
                        order_by = "max_district"
                        self.guarded_annotation(order_by, max_districts_subq)
                case Column.RISO.value:
                    if is_order_asc:
                        order_by = "min_risos"
                        self.guarded_annotation(order_by, min_riso_subq)
                    else:
                        order_by = "max_risos"
                        self.guarded_annotation(order_by, max_riso_subq)
                case Column.IPMA.value:
                    if is_order_asc:
                        order_by = "min_ipma"
                        self.guarded_annotation(order_by, min_ipma_subq)
                    else:
                        order_by = "max_ipma"
                        self.guarded_annotation(order_by, min_ipma_subq)

            order_expr = (
                F(order_by).asc(nulls_last=True)
                if is_order_asc
                else F(order_by).desc(nulls_last=True)
            )
            self.queryset = self.queryset.order_by(order_expr).distinct()
        except FieldError as e:
            logging.error(f"Error when sorting iapp query by {sort_column}, {e}")
            self.queryset = self.queryset.order_by(Column.SITE.value)
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
