import logging
from rest_framework import status
from ninja import Router, Query
from django.db import transaction
from django.db.models import OuterRef, Exists
from api.ninja_authentication import NinjaKeycloakAuthentication
from api.models.mapping import ZoneOfInterest
from api.serializers import ActivityRecordSetRowByType
from api.models.activity import Activity
from . import SummaryIn

ROOT_PATH = "/summary"
router = Router(auth=NinjaKeycloakAuthentication())
log = logging.getLogger(__name__)


@router.get("", response={200: dict})
def get_summary(request, filters: Query[SummaryIn]):
    with transaction.atomic():
        query = Activity.objects.all()
        if filters.zone:
            zones = ZoneOfInterest.objects.filter(
                public_id__in=filters.zone,
                shape__intersects=OuterRef("computed_tile_shape"),
            )
            query = query.filter(Exists(zones))

        return ActivityRecordSetRowByType(query).data
