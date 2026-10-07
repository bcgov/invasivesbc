from django.contrib.auth.models import AbstractBaseUser
from django.db import models
from api.constants import WellKnownRoles
from typing import List
from api.models.auth.role import Role


class User(AbstractBaseUser):

    username = None
    password = None
    last_login = None

    subject = models.CharField(
        blank=False,
        null=False,
        max_length=255,
        unique=True,
        db_index=True,
        primary_key=True,
        default="Unset",
    )

    USERNAME_FIELD = "subject"

    roles = models.ManyToManyField(Role, db_table='"authentication"."user_roles"')

    display_name = models.CharField(null=True, blank=True, max_length=512)
    email = models.EmailField(null=True, blank=True, max_length=512)

    last_seen = models.DateField(
        null=True,
        db_comment="Date (not including time information, to reduce database updates) the user last authenticated.",
    )

    class Meta:
        db_table = '"authentication"."user"'

    def natural_key(self):
        return (self.subject,)

    def has_any_role(self, roles: List[WellKnownRoles]) -> bool:
        """Check if the user has AT LEAST ONE of the specified roles."""
        return self.roles.filter(name__in=roles).exists()
