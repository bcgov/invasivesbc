from django.contrib.auth.models import AbstractBaseUser
from django.db import models

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

    def natural_key(self):
        return (self.subject,)

    class Meta:
        db_table = '"authentication"."user"'
