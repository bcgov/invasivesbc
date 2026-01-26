from django.contrib.auth.models import AbstractBaseUser
from django.db import models


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

    def natural_key(self):
        return (self.subject,)

    class Meta:
        db_table = '"authentication"."user"'
