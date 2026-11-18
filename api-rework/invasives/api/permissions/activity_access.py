from enum import IntFlag

from django.db.models import Case, Exists, F, IntegerField, OuterRef, Q, Value, When

from api.models.activity import (
    Activity,
    ActivitySubtypes,
    DraftActivity,
    TerrestrialBiocontrolCollectionEntry,
    TerrestrialBiocontrolDispersalMonitoringEntry,
    TerrestrialBiocontrolReleaseEntry,
    DraftTerrestrialBiocontrolCollectionEntry,
    DraftTerrestrialBiocontrolDispersalMonitoringEntry,
    DraftTerrestrialBiocontrolReleaseEntry,
)
from api.models.activity import Employer, FundingAgency
from api.models.auth import AgencyAssociation, EmployerAssociation
from api.models.iapp import IAPPSite


class ActivityAccess(IntFlag):
    NONE = 0
    READ = 1
    MODIFY = 2
    SUBMIT = 4
    DELETE = 8


ADMIN_ROLES = frozenset({"ADMINISTRATOR", "MASTER_ADMINISTRATOR"})
SENSITIVE_ROLES = ADMIN_ROLES | {"BIOCONTROL_USER"}
PLANT_ROLES = frozenset(
    {
        "ADMINISTRATOR_PLANTS",
        "BCGOV_STAFF_PLANTS",
        "BCGOV_STAFF_BOTH",
        "CONTRACTOR_MANAGER_PLANTS",
        "CONTRACTOR_MANAGER_BOTH",
        "CONTRACTOR_STAFF_PLANTS",
        "CONTRACTOR_STAFF_BOTH",
        "INDIGENOUS_RISO_MANAGER_PLANTS",
        "INDIGENOUS_RISO_MANAGER_BOTH",
        "INDIGENOUS_RISO_STAFF_PLANTS",
        "INDIGENOUS_RISO_STAFF_BOTH",
        "DATA_MANAGER_PLANTS",
        "DATA_MANAGER_BOTH",
    }
)
EMPLOYER_EDIT_ROLES = frozenset(
    {
        "CONTRACTOR_MANAGER_PLANTS",
        "CONTRACTOR_MANAGER_BOTH",
        "INDIGENOUS_RISO_MANAGER_PLANTS",
        "INDIGENOUS_RISO_MANAGER_BOTH",
        "DATA_MANAGER_PLANTS",
        "DATA_MANAGER_BOTH",
    }
)
AGENCY_EDIT_ROLES = frozenset(
    {
        "INDIGENOUS_RISO_MANAGER_PLANTS",
        "INDIGENOUS_RISO_MANAGER_BOTH",
        "DATA_MANAGER_PLANTS",
        "DATA_MANAGER_BOTH",
    }
)
BIOCONTROL_SUBTYPES = frozenset(
    {
        ActivitySubtypes.Biocontrol_Collection.name,
        ActivitySubtypes.Biocontrol_Release.name,
        ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name,
        ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name,
    }
)
PLANT_SUBTYPES = frozenset(
    subtype.name
    for subtype in ActivitySubtypes
    if subtype.name not in {"Observation_Mussels", "Officer_Shift"}
)
ALL_SUBTYPES = frozenset(subtype.name for subtype in ActivitySubtypes)

# Snapshot of invasivesbc.private_biocontrol_agents, authoritative V1 copy.
PRIVATE_AGENT_CODES = frozenset("""
    ACERANG ACERCHO ACERMAL AGRIHYP ALTICAR APHAITA APHICHL APHTCZW APHTFLA
    APHTLAC ARCHNEU AULAACR AULASUB BAGONOD BRADGIL CALOLUN CEUTCON CEUTSCR
    CHAEACR CHARSEX CHEIURB CHRYVAR CYSTSON DELOGUT DICHAER ETEOINT ETEOSER
    HADRLIT HYLEEUP HYLOTRA JAAPIVA LENIGEM LONGFLA LONGJACS LONGQUA MICREDE
    MICRMIL MINOMUR OMPHHOO PELOMED PTERINS RHINLIN RHINPIL RHOPTRI SPURESU
    SUBAPIC TEREVIR TRICHOR UROPJAC UROPSOL ZEUXGIA
    """.split())

# Codes present in the checked-in V2 code snapshot. New codes need review
# against the authoritative V1 private list before they become readable.
KNOWN_AGENT_CODES = frozenset("""
    ACERANG ACERCHO ACERGEN ACERMAL AGAPZOE AGONNER AGRIHYP ALTICAR APHAITA
    APHICHL APHTCYP APHTCZW APHTFLA APHTLAC APHTNIG APHTSPP APLOPLA ARCHNEU
    AULAACR AULASUB BAGONOD BANGFAU BOTASEN BRACPUL BRADGIL BRUCVIL CALOLUN
    CASSRUB CEUTSCR CHAEACR CHARSEX CHEIGRO CHEIURB CHRYHYP CHRYQUA CHRYSPP
    CHRYVAR COCHATR CYPHACH CYSTSCH CYSTSON DELOGUT DICHAER ETEOINT ETEOSER
    EXAPFUS GALECAL GALEPUS HADRLIT HYLEEUP HYLOTRA JAAPIVA LARICAR LARIMIN
    LARIOBT LARISPP LENIGEM LOBEEUP LONGFLA LONGGRA LONGJAC LONGJAS LONGQUA
    MECIJAN METZLAP METZPAU MICREDE MICRLAR MINOMUR MOGUCRU OMPHHOO PELOMED
    PTERINS PUCCACR PUCCCAR PUCCCHO PUCCJAC PUCCPUN RHINANT RHINCON RHINLIN
    RHINNET RHINPIL RHINTET RHOPTRI SCLESCL SPHEJUG SPURESU SUBAPIC TERERUF
    TEREVIR TRICHOR TYRIJAC UROPAFF UROPCAR UROPJAC UROPQUA UROPSOL UROPSPP
    UROPSTY ZEUXGIA
    """.split())
# These V2 codes name the same organism as the V1-sensitive LONGJACS code.
UNMAPPED_SENSITIVE_ALIASES = frozenset({"LONGJAC", "LONGJAS"})
PUBLIC_AGENT_CODES = (
    KNOWN_AGENT_CODES - PRIVATE_AGENT_CODES - UNMAPPED_SENSITIVE_ALIASES
)


def _role_names(user) -> frozenset:
    if user is None or not getattr(user, "is_authenticated", False):
        return frozenset()
    return frozenset(user.roles.values_list("name", flat=True))


def readable_subtypes(roles):
    if roles & ADMIN_ROLES:
        return ALL_SUBTYPES
    subtypes = set()
    if "DATA_MANAGER" in roles:
        subtypes.update(ALL_SUBTYPES)
    if roles & PLANT_ROLES:
        subtypes.update(PLANT_SUBTYPES)
    if "BIOCONTROL_USER" in roles:
        subtypes.update(BIOCONTROL_SUBTYPES)
    return frozenset(subtypes)


def writable_subtypes(roles):
    if roles & ADMIN_ROLES:
        return ALL_SUBTYPES
    subtypes = set(PLANT_SUBTYPES if roles & PLANT_ROLES else ())
    if "BIOCONTROL_USER" in roles:
        subtypes.update(BIOCONTROL_SUBTYPES)
    return frozenset(subtypes)


def can_read_activity_payload(user, payload):
    if _role_names(user) & SENSITIVE_ROLES:
        return True
    subtype = payload.get("subtype")
    if subtype not in BIOCONTROL_SUBTYPES:
        return True
    entries = (payload.get("subtype_data") or {}).get("entries") or []
    if not entries:
        return False
    site_ids = []
    for entry in entries:
        agent = entry.get("biocontrol_agent")
        if getattr(agent, "pk", agent) not in PUBLIC_AGENT_CODES:
            return False
        if entry.get("historical_iapp_site") is not None:
            site_ids.append(entry["historical_iapp_site"])
    return not IAPPSite.objects.filter(site_id__in=site_ids, protected=True).exists()


def _sensitive_expressions(is_draft):
    models = (
        (
            DraftTerrestrialBiocontrolCollectionEntry,
            DraftTerrestrialBiocontrolReleaseEntry,
            DraftTerrestrialBiocontrolDispersalMonitoringEntry,
        )
        if is_draft
        else (
            TerrestrialBiocontrolCollectionEntry,
            TerrestrialBiocontrolReleaseEntry,
            TerrestrialBiocontrolDispersalMonitoringEntry,
        )
    )
    expressions = {}
    for index, model in enumerate(models):
        entries = model.objects.filter(activity_data_record__activity_id=OuterRef("pk"))
        expressions[f"_agent_present_{index}"] = Exists(entries)
        expressions[f"_private_agent_{index}"] = Exists(
            entries.exclude(biocontrol_agent_id__in=PUBLIC_AGENT_CODES)
        )
        if hasattr(model, "historical_iapp_site"):
            expressions[f"_protected_site_{index}"] = Exists(
                entries.filter(
                    historical_iapp_site__in=IAPPSite.objects.filter(
                        protected=True
                    ).values("site_id")
                )
            )
    return expressions


def annotate_activity_access(queryset, user, name="access_level"):
    roles = _role_names(user)
    is_draft = queryset.model is DraftActivity
    annotations = _sensitive_expressions(is_draft)
    readable = (
        Q(pk__isnull=False)
        if roles & ADMIN_ROLES
        else Q(subtype__in=readable_subtypes(roles))
    )
    if is_draft and not roles & ADMIN_ROLES:
        readable &= Q(creating_user_id=getattr(user, "pk", None))
    if not roles & SENSITIVE_ROLES:
        for alias in annotations:
            if alias.startswith(("_private_agent_", "_protected_site_")):
                readable &= Q(**{alias: False})
        has_agent = (
            Q(_agent_present_0=True)
            | Q(_agent_present_1=True)
            | Q(_agent_present_2=True)
        )
        readable &= ~Q(subtype__in=BIOCONTROL_SUBTYPES) | has_agent

    editable = Q(pk__in=[])
    if roles & ADMIN_ROLES:
        editable = Q(pk__isnull=False)
    elif is_draft:
        editable = Q(
            creating_user_id=getattr(user, "pk", None),
            subtype__in=writable_subtypes(roles),
        )
    else:
        editable = Q(
            creating_user_id=getattr(user, "pk", None),
            subtype__in=writable_subtypes(roles),
        )
        if "ADMINISTRATOR_PLANTS" in roles:
            editable |= Q(subtype__in=PLANT_SUBTYPES)
        if roles & EMPLOYER_EDIT_ROLES:
            employers = (
                EmployerAssociation.objects.currently_valid()
                .filter(user=user, is_primary=True)
                .values("employer_id")
            )
            annotations["_same_employer"] = Exists(
                Employer.objects.filter(
                    activity_data_record__activity_id=OuterRef("pk"),
                    employer_id__in=employers,
                )
            )
            editable |= Q(_same_employer=True, subtype__in=PLANT_SUBTYPES)
        if roles & AGENCY_EDIT_ROLES:
            agencies = (
                AgencyAssociation.objects.currently_valid()
                .filter(user=user, is_primary=True)
                .values("agency_id")
            )
            annotations["_same_agency"] = Exists(
                FundingAgency.objects.filter(
                    activity_data_record__activity_id=OuterRef("pk"),
                    agency_id__in=agencies,
                )
            )
            editable |= Q(_same_agency=True, subtype__in=PLANT_SUBTYPES)

    access = Case(
        When(readable, then=Value(int(ActivityAccess.READ))),
        default=Value(0),
        output_field=IntegerField(),
    ) + Case(
        When(readable & editable, then=Value(int(ActivityAccess.MODIFY))),
        default=Value(0),
        output_field=IntegerField(),
    )
    if is_draft:
        access += Case(
            When(readable & editable, then=Value(int(ActivityAccess.SUBMIT))),
            default=Value(0),
            output_field=IntegerField(),
        )
    return queryset.annotate(**annotations).annotate(**{name: access})


def filter_activities_by_access(queryset, user, required=ActivityAccess.READ):
    name = "access_level"
    return (
        annotate_activity_access(queryset, user, name)
        .annotate(_access_has_required=F(name).bitand(int(required)))
        .filter(_access_has_required=int(required))
    )


def get_activity_access(user, activity):
    if not activity.pk:
        return ActivityAccess.NONE
    value = (
        annotate_activity_access(type(activity).objects.filter(pk=activity.pk), user)
        .values_list("access_level", flat=True)
        .first()
    )
    return ActivityAccess(value or 0)


def get_activity_permissions(user, activity):
    access = get_activity_access(user, activity)
    return {
        "can_submit": bool(access & ActivityAccess.SUBMIT),
        "can_edit": bool(access & ActivityAccess.MODIFY),
        "can_delete": False,
    }
