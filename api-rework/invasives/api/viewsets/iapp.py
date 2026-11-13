from api.models.iapp import IAPPSite, IAPPSiteSelection, IAPPSurvey
from api.permissions import HasAdminRole
from api.serializers.iapp import (
    IAPP_CHILD_SERIALIZERS,
    IAPP_RECORD_TYPES,
    IAPPSiteListSerializer,
    IAPPSiteSerializer,
    record_type_annotation,
)
from api.viewsets.mixins.atomic import AtomicViewSetMixin
from django.db.models import Exists, OuterRef, Subquery
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.viewsets import ReadOnlyModelViewSet

_first_selection = IAPPSiteSelection.objects.filter(site_id=OuterRef("pk")).order_by(
    "siteselectionid"
)


class IAPPPagination(LimitOffsetPagination):
    default_limit = 1000
    max_limit = 10000


class IAPPViewSet(AtomicViewSetMixin, ReadOnlyModelViewSet):
    """Read-only access to historical IAPP sites."""

    permission_classes = [HasAdminRole]
    pagination_class = IAPPPagination
    lookup_value_regex = r"\d+"

    def get_queryset(self):
        if self.action == "list":
            return IAPPSite.objects.annotate(
                survey_date=Subquery(
                    IAPPSurvey.objects.filter(site_id=OuterRef("pk"))
                    .order_by("-survey_date")
                    .values("survey_date")[:1]
                ),
                species=Subquery(_first_selection.values("invasive_plant")[:1]),
                latitude=Subquery(_first_selection.values("decimal_latitude")[:1]),
                longitude=Subquery(_first_selection.values("decimal_longitude")[:1]),
                **{
                    record_type_annotation(name): Exists(
                        IAPPSite._meta.get_field(related).related_model.objects.filter(
                            site_id=OuterRef("pk")
                        )
                    )
                    for name, related in IAPP_RECORD_TYPES.items()
                },
            ).order_by("site_id")
        return IAPPSite.objects.prefetch_related(*IAPP_CHILD_SERIALIZERS).order_by(
            "site_id"
        )

    def get_serializer_class(self):
        if self.action == "list":
            return IAPPSiteListSerializer
        return IAPPSiteSerializer
