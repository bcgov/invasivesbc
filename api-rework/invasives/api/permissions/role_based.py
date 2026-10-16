from typing import cast

from celery.app.log import Logging
from rest_framework.permissions import BasePermission

import logging

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
            .roles.filter(
                name__in=[
                    WellKnownRoles.ADMINISTRATOR.value,
                    WellKnownRoles.MASTER_ADMINISTRATOR.value,
                ]
            )
            .exists()
        )


class HasAnyApplicationRole(BasePermission):
    """eg is not an anonymous user - has at least one assigned role"""

    def has_permission(self, request, view):
        if not request.user:
            return False

        if not isinstance(request.user, User):
            return False

        return cast(User, request.user).roles.count() > 0
