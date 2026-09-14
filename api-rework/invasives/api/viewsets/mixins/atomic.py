from django.db import transaction
from rest_framework import viewsets


class AtomicViewSetMixin:
    """wrap all ViewSet actions in an atomic transaction."""

    @transaction.atomic
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class AtomicModelViewSet(AtomicViewSetMixin, viewsets.ModelViewSet):
    pass
