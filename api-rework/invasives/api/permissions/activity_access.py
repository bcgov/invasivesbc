from enum import IntFlag

from django.db.models import Case, F, IntegerField, Q, QuerySet, Value, When

from api.constants import WellKnownRoles
from api.models.enums.activity_type import ActivityType

ADMIN_ROLES = frozenset(
    {WellKnownRoles.ADMINISTRATOR.value, WellKnownRoles.MASTER_ADMINISTRATOR.value}
)
BIOCONTROL_ROLES = ADMIN_ROLES | {WellKnownRoles.BIOCONTROL_USER.value}


class ActivityAccess(IntFlag):
    NONE = 0
    READ = 1
    MODIFY = 2
    SUBMIT = 4
    DELETE = 8


def _role_names(user) -> frozenset:
    if user is None or not getattr(user, "is_authenticated", False):
        return frozenset()
    return frozenset(user.roles.values_list("name", flat=True))


def _is_creator(user, activity) -> bool:
    user_pk = getattr(user, "pk", None)
    return user_pk is not None and activity.creating_user_id == user_pk


def get_activity_access(user, activity) -> ActivityAccess:
    """Access level of `user` on a single `activity` instance."""
    roles = _role_names(user)
    if not roles and not _is_creator(user, activity):
        return ActivityAccess.NONE

    if activity.type == ActivityType.Biocontrol and not roles & BIOCONTROL_ROLES:
        return ActivityAccess.NONE

    return ActivityAccess.READ


def annotate_activity_access(queryset: QuerySet, user, name: str = "access_level"):
    """
    Annotate each row with the ActivityAccess flag value for `user`.
    Mirrors get_activity_access, evaluated in the database.
    """
    roles = _role_names(user)
    user_pk = getattr(user, "pk", None)

    if roles & BIOCONTROL_ROLES:
        readable = Q(pk__isnull=False)
    else:
        readable = ~Q(type=ActivityType.Biocontrol)

    if not roles:
        readable &= Q(creating_user_id=user_pk) if user_pk is not None else Q(pk__in=[])

    expr = Case(
        When(readable, then=Value(int(ActivityAccess.READ))),
        default=Value(int(ActivityAccess.NONE)),
        output_field=IntegerField(),
    )

    return queryset.annotate(**{name: expr})


def filter_activities_by_access(
    queryset: QuerySet, user, required: ActivityAccess = ActivityAccess.READ
):
    """Restrict an Activity queryset to rows where `user` holds every flag in `required`."""
    name = "access_level"
    return (
        annotate_activity_access(queryset, user, name)
        .annotate(_access_has_required=F(name).bitand(int(required)))
        .filter(_access_has_required=int(required))
    )
