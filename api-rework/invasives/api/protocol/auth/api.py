import logging
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from ninja import Router
from api.models.auth import User
from api.ninja_authentication import NinjaKeycloakAuthentication, NinjaRoleRequired
from api.constants import WellKnownRoles
from . import UserProfileOut, UserAccessIn

ROOT_PATH = "/auth"
router = Router(auth=NinjaKeycloakAuthentication())

log = logging.getLogger(__name__)


@router.get("/user", response={200: UserProfileOut, 401: None})
def get_self(request):
    """Return requesters own profile"""
    if request.auth:
        return request.auth
    return HttpResponse(status=status.HTTP_401_UNAUTHORIZED)


@router.get(
    "/user/{subject}",
    response={200: UserProfileOut},
    auth=NinjaRoleRequired(
        WellKnownRoles.MASTER_ADMINISTRATOR,
        WellKnownRoles.ADMINISTRATOR,
    ),
)
def get_user(request, subject):
    """Return Profile of specified user"""
    return get_object_or_404(User, subject=subject)


@router.post("/register", response={201: dict, 204: dict})
def request_access(request, data: UserAccessIn):
    return JsonResponse(
        status=status.HTTP_201_CREATED,
        data=data.model_dump(mode="json"),
    )
