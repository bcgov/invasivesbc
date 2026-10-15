import logging
from ninja import Router, Query
from django.db import transaction
from typing import List
from django.db.models import OuterRef, Exists
from api.ninja_authentication import NinjaKeycloakAuthentication
from api.models.mapping import ZoneOfInterest
from api.protocol.activity.activity_plant_summary_out import ActivityPlantSummaryOut
from api.models.activity import Activity
from . import SummaryIn

ROOT_PATH = "/summary"
router = Router(auth=NinjaKeycloakAuthentication())
log = logging.getLogger(__name__)


@router.get("", response={200: ActivityPlantSummaryOut})
def get_summary(request, filters: Query[SummaryIn]):
    with transaction.atomic():
        query = Activity.objects.all()
        if filters.zone:
            zones = ZoneOfInterest.objects.filter(
                public_id__in=filters.zone,
                shape__intersects=OuterRef("computed_tile_shape"),
            )
            query = query.filter(Exists(zones))
        if filters.user:
            query = query.filter(creating_user=filters.user)

        return query.order_by("-date")
