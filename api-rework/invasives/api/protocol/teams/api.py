from ninja import Router
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import JsonResponse, HttpResponse
from api.ninja_authentication import NinjaKeycloakAuthentication
from api.models.teams import TeamMember, Team, TeamInvitation
from api.constants import WellKnownRoles
from api.serializers.teams import UserTeamsRowSerializer, SingleTeamSerializer
from rest_framework import status
from . import CreateTeamSchema

ROOT_PATH = "/teams"

router = Router(auth=NinjaKeycloakAuthentication())


@router.get("", response={206: list})
def get_list_of_teams(request):
    """
    :Access: All users

    Get list of all Teams requesting user has membership in
    """
    user_teams = TeamMember.objects.filter(
        user=request.auth,
        leave_date=None,
        team__disbanded_date=None,
    )
    return UserTeamsRowSerializer(user_teams, many=True).data


@router.post("")
def create_team(request, data: CreateTeamSchema):
    """
    :Access: DataManagers

    Endpoint for Data Managers to create a new team. Requesting user is auto-enlisted into team.
    """
    # TODO: Limit to DataManager role access
    if Team.objects.filter(founder=request.auth, name=data.name).exists():
        return HttpResponse(status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        """Create team, then set user as member"""
        team = Team.objects.create(founder=request.auth, name=data.name)
        team.agencies.set([a.agency for a in data.agencies])
        TeamMember.objects.create(team=team, user=request.auth)
        return HttpResponse(status.HTTP_200_OK)


@router.get("/{id}")
def get_team_info(request, id: int):
    """Returns all info for a specified team"""
    user_in_team = TeamMember.objects.filter(
        user=request.auth,
        team__id=id,
    ).exists()
    if not user_in_team:
        return HttpResponse(status.HTTP_401_UNAUTHORIZED)

    team = get_object_or_404(Team, id=id, disbanded_date=None)
    return SingleTeamSerializer(team).data


@router.delete("/{id}")
def disband_team(request, id):
    """Disband a team"""
    team = get_object_or_404(Team, pk=id, founder=request.auth, disbanded_date=None)
    team.disbanded_date = timezone.now().date()
    team.save()
