from typing import List

from ninja import Router, Body
from ninja.errors import HttpError
from datetime import datetime
import uuid
from api.models.activity import Activity
from api.ninja_authentication import NinjaKeycloakAuthentication
from api.models.enums import FormStatus
from api.protocol.activity.activity import (
    ActivityMinimal,
    ActivityOut,
    ActivitySearchParameters,
    ActivitySearchResult,
)
from api.protocol.activity.plant_subtypes.union_definition import PlantActivitySchema

router = Router(auth=NinjaKeycloakAuthentication())


# Helper
def mock_record_id():
    """Mock Function for generating short ID's"""
    year_prefix = datetime.now().strftime("%y")
    id = uuid.uuid4()
    short_id = f"{year_prefix}PTO{id.hex[:8]}"

    return {"short_id": short_id.upper(), "id": str(id)}


# Routes


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


@router.post("/submit")
def submit_record(request, data: PlantActivitySchema = Body(...)):
    data = data.model_dump()
    val = mock_record_id()
    data["id"] = val["id"]
    data["short_id"] = val["short_id"]
    data["type"] = "Submitted"
    return data


@router.post("/draft")
def submit_draft_record(request, data: PlantActivitySchema = Body(...)):
    data = data.model_dump()
    val = mock_record_id()
    data["id"] = val["id"]
    data["short_id"] = val["short_id"]
    data["type"] = "Draft"
    return data


@router.api_operation(["GET"], "/{id}", response=ActivityOut)
def get_activity_by_id(request, id: str):
    activity = Activity.objects.get(id=id)
    return activity


@router.api_operation(["DELETE"], "/{id}", response={204: None})
def delete_activity_by_id(request, id: str):
    # TODO: Deviate between Draft and Submitted Models, Add Permission Checks on User to ensure no invalid deletions
    raise HttpError(
        message="This endpoint is stubbed and currently under development.",
        status_code=501,
    )
    if Activity.objects.get(id=id).exists():
        record = Activity.objects.get(id=id)
        record.form_status = FormStatus.Deleted
        record.save(update_fields=["form_status"])
    elif DraftActivity.objects(id=id).exists():
        # TODO: If Draft Activity Objects. Exists, Delete it.
        pass
