from django.db import models
from django.core.exceptions import PermissionDenied


class ReadOnlyQuerySet(models.QuerySet):
    def update(self, *args, **kwargs):
        raise PermissionDenied("Updates are not allowed on this read-only model.")

    def delete(self, *args, **kwargs):
        raise PermissionDenied("Deletions are not allowed on this read-only model.")

    def bulk_create(self, *args, **kwargs):
        raise PermissionDenied("Bulk creation is not allowed on this read-only model.")


class ReadOnlyManager(models.Manager):
    def get_queryset(self):
        return ReadOnlyQuerySet(self.model, using=self._db)
