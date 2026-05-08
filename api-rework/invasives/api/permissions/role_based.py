from typing import cast

from rest_framework.permissions import BasePermission

from api.constants import WellKnownRoles
from api.models import User


class HasAdminRole(BasePermission):
    """
    Allows access only to admin users.
    """

    def has_permission(self, request, view):
        if not request.user:
            return False

        if not isinstance(request.user, User):
            return False

        return (
            cast(User, request.user)
            .roles.filter(name=WellKnownRoles.ADMINISTRATOR.value)
            .exists()
        )
