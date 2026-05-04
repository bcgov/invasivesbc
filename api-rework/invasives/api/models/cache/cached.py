from datetime import timedelta

from django.db import models
from django.utils import timezone


def default_expiry_time():
    return timezone.now() + timedelta(days=30)


class Cached(models.Model):
    key = models.CharField(max_length=128, unique=True, primary_key=True)

    expires = models.DateTimeField(default=default_expiry_time(), null=True, blank=True)
    modified = models.DateTimeField(auto_now=True, null=False, blank=False)

    class Meta:
        abstract = True
