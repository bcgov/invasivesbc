from typing import List

from ninja import Router

from api.models.activity import Activity
from api.ninja_authentication import NinjaKeycloakAuthentication
from api.protocol.activity.activity import (
    ActivityMinimal,
    ActivityOut,
    ActivitySearchParameters,
    ActivitySearchResult,
)

router = Router(auth=NinjaKeycloakAuthentication())


@router.get("/", response=List[ActivityMinimal])
def list_activities(request):
    return [
        ActivityMinimal(**d)
        for d in Activity.objects.values(
            "id", "short_id", "type", "subtype", "date"
        ).all()
    ]


@router.post("/search", response=ActivitySearchResult)
def activity_search(request, search: ActivitySearchParameters):
    result = ActivitySearchResult(
        items=[
            ActivityMinimal(**d)
            for d in Activity.objects.filter(
                date__gt=search.date_from, date__lt=search.date_to
            )
            .values("id", "short_id", "type", "subtype", "date")
            .all()
        ],
        search=search,
    )
    return result


@router.get("/{id}", response=ActivityOut)
def get_activity_by_id(request, id: str):
    activity = Activity.objects.get(id=id)
    return activity
