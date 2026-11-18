from deepdiff import DeepDiff
from django.contrib.gis.geos import GEOSGeometry
from django.db import transaction
from django.shortcuts import get_object_or_404
import json
from ninja import Router, Schema
from ninja.errors import HttpError
from typing import List

from api.ninja_authentication import NinjaAnyRoleRequired
from api.models.activity import Activity, DraftActivity, ActivitySubtypes
from api.models.audits import ActivityModificationRecord
from api.models.enums import FormStatus
from api.schemas.plant_activity import ACTIVITY_PROCESSORS, DRAFT_ACTIVITY_PROCESSORS
from api.protocol.activity.activity import (
    ActivityMinimal,
    ActivitySearchParameters,
    ActivitySearchResult,
)
from api.permissions.activity_access import (
    ActivityAccess,
    _role_names,
    can_read_activity_payload,
    filter_activities_by_access,
    get_activity_access,
    writable_subtypes,
)
from api.protocol.activity.plants_out.plant_record_with_metadata import (
    PlantRecordWithMetadataOut,
)
from api.protocol.activity.plant_subtypes.union_definition import (
    PlantActivitySchema,
    DraftPlantActivitySchema,
)
from api.serializers.activity import ActivitySerializer
from api.utils.deepdiff import AtomicFieldOperator

router = Router(auth=NinjaAnyRoleRequired())


class CreationPermissionsOut(Schema):
    can_create: bool


@router.get("/creation-permissions/{subtype}", response=CreationPermissionsOut)
def creation_permissions(request, subtype: str):
    return {
        "can_create": subtype in ACTIVITY_PROCESSORS
        and subtype in writable_subtypes(_role_names(request.auth))
    }


def authorize_payload(user, payload):
    if payload.get("subtype") not in writable_subtypes(_role_names(user)):
        raise HttpError(403, "Insufficient permissions for activity subtype")
    if not can_read_activity_payload(user, payload):
        raise HttpError(403, "Insufficient permissions for activity contents")
    linked_ids = {str(item["full"]) for item in payload.get("linked_activities") or []}
    if linked_ids:
        readable = filter_activities_by_access(
            Activity.objects.filter(pk__in=linked_ids), user
        ).values_list("pk", flat=True)
        if {str(pk) for pk in readable} != linked_ids:
            raise HttpError(403, "Insufficient permissions for linked activities")


@router.get("/", response=List[ActivityMinimal])
def list_activities(request):
    return [
        ActivityMinimal(**d)
        for d in filter_activities_by_access(Activity.objects.all(), request.auth)
        .values("id", "short_id", "type", "subtype", "date")
        .all()
    ]


@router.post("/search", response=ActivitySearchResult)
def activity_search(request, search: ActivitySearchParameters):
    result = ActivitySearchResult(
        items=[
            ActivityMinimal(**d)
            for d in filter_activities_by_access(
                Activity.objects.filter(
                    date__gt=search.date_from, date__lt=search.date_to
                ),
                request.auth,
            )
            .values("id", "short_id", "type", "subtype", "date")
            .all()
        ],
        search=search,
    )
    return result


@router.post("/submit", response={200: PlantRecordWithMetadataOut})
def submit_record(request, data: PlantActivitySchema):
    """
    Handler for Incoming records with "Submitted" status.
    Performs strict validation on payload to ensure data integrity.
    - Adds record to the 'activity' schema
    - Adds Activity Modification Record if changes found (update)
    """
    with transaction.atomic():
        # Housekeeping on incoming record
        payload = data.model_dump(mode="python", exclude_unset=True)
        payload["form_status"] = FormStatus.Submitted.value

        # Check if Updating, or creating a new record
        activity_id = payload.get("id")
        if (
            existing_record := Activity.objects.select_for_update()
            .filter(id=activity_id)
            .first()
        ):
            if (
                not get_activity_access(request.auth, existing_record)
                & ActivityAccess.MODIFY
            ):
                raise HttpError(403, "Insufficient permissions to edit activity")
            # Protect original values.
            payload["created_by"] = existing_record.created_by
            payload["creating_user"] = existing_record.creating_user
            # Serialize /before/ updating else diff won't work.
            old_activity_for_diffing = ActivitySerializer(
                existing_record, read_only=True
            ).data
        else:
            draft = (
                DraftActivity.objects.select_for_update().filter(id=activity_id).first()
            )
            if (
                draft
                and not get_activity_access(request.auth, draft) & ActivityAccess.SUBMIT
            ):
                raise HttpError(403, "Insufficient permissions to submit draft")
            if Activity.all_objects.filter(id=activity_id).exists():
                raise HttpError(409, "A deleted activity already exists with this ID")
            payload["creating_user"] = draft.creating_user if draft else request.auth
            if draft:
                payload["created_by"] = draft.created_by

        subtype_key = payload.get("subtype")
        authorize_payload(request.auth, payload)
        processor = ACTIVITY_PROCESSORS.get(subtype_key)
        if not processor:
            raise HttpError(400, f"Unsupported activity subtype: {subtype_key}")

        processed_activity = processor.process(
            payload=payload, instance=existing_record
        )
        if (
            not get_activity_access(request.auth, processed_activity)
            & ActivityAccess.READ
        ):
            raise HttpError(403, "Insufficient permissions for activity contents")
        new_record_for_diffing = ActivitySerializer(
            processed_activity, read_only=True
        ).data

        if existing_record:
            diff = DeepDiff(
                old_activity_for_diffing,
                new_record_for_diffing,
                custom_operators=[
                    AtomicFieldOperator(regex_paths=[r"root\['shape'\]"])
                ],
            )
            if diff:
                ActivityModificationRecord.objects.create(
                    user=request.auth,
                    diff=json.loads(diff.to_json()),
                    activity=existing_record,
                    platform="web",
                )
        # Delete Draft of record (if exists)
        if not existing_record and draft:
            draft.delete()

        return processed_activity


@router.post("/draft", response={200: PlantRecordWithMetadataOut})
def submit_draft_record(request, data: DraftPlantActivitySchema):
    """
    Handler for Incoming records with "Draft" status.
    Performs loose validation on incoming data to remove extraneous keys and ensure payload integrity
    - Adds record to the 'draft_activity' schema
    """
    with transaction.atomic():
        payload = data.model_dump(mode="python", exclude_unset=True)

        # Check if record exists as submission
        submission_exists = Activity.all_objects.filter(pk=payload["id"]).exists()
        if submission_exists:
            # Should perform more checks in case ID is a collision [low-likelihood]
            raise HttpError(
                "A submitted record already exists with this ID. Cannot convert to draft record.",
                status=409,
            )

        # Determine if Create or Update
        instance = (
            DraftActivity.objects.select_for_update()
            .filter(id=payload.get("id"))
            .first()
        )
        if (
            instance
            and not get_activity_access(request.auth, instance) & ActivityAccess.MODIFY
        ):
            raise HttpError(403, "Insufficient permissions to edit draft")
        if instance:
            payload["creating_user"] = instance.creating_user
            payload["created_by"] = instance.created_by
        else:
            payload["creating_user"] = request.auth

        subtype_key = payload.get("subtype")
        authorize_payload(request.auth, payload)
        processor = DRAFT_ACTIVITY_PROCESSORS.get(subtype_key)
        if not processor:
            raise HttpError(400, f"Unsupported activity subtype: {subtype_key}")

        draft = processor.process(payload=payload, instance=instance)
        if not get_activity_access(request.auth, draft) & ActivityAccess.READ:
            raise HttpError(403, "Insufficient permissions for draft contents")
        return draft


@router.api_operation(["GET"], "/{id}", response=PlantRecordWithMetadataOut)
def get_activity_by_id(request, id: str):
    if activity := filter_activities_by_access(
        Activity.objects.filter(id=id), request.auth
    ).first():
        return activity
    return get_object_or_404(
        filter_activities_by_access(DraftActivity.objects.all(), request.auth), pk=id
    )


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
