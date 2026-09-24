from ninja import Router
from django.db import transaction
from django.db.models import Q
from typing import List, Dict
from pydantic import PositiveInt
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from api.ninja_authentication import NinjaKeycloakAuthentication
from api.models.teams import TeamMember, Team, InviteStatus, TeamInvitation
from api.models.auth import User
from api.serializers.teams import (
    ElevatedSingleTeamSerializer,
    UserTeamsRowSerializer,
    SingleTeamSerializer,
    UserTeamInvitationSerializer,
)
from rest_framework import status
from . import (
    CreateTeamSchema,
    UpdateTeamSchema,
    InviteUserToTeamSchema,
    InvitationResponseSchema,
)

"""
Routes:
    /teams/team               GET/POST
    /teams/team/{id}          GET/PATCH/DELETE
    /teams/team/{id}/invite   POST
    /teams/invite             GET/PATCH
"""


ROOT_PATH = "/teams"
router = Router(auth=NinjaKeycloakAuthentication())


##############
# Team Creation Handling
###


@router.get("/team", response={200: List[Dict]})
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


@router.post("/team")
def create_team(request, data: CreateTeamSchema):
    """
    :Access: DataManagers

    Endpoint for Data Managers to create a new team. Requesting user is auto-enlisted into team.
    """
    with transaction.atomic():
        # TODO: Limit to DataManager/Administrator role access
        if Team.objects.filter(founder=request.auth, name=data.name).exists():
            return HttpResponse(
                status=status.HTTP_409_CONFLICT,
                content="You already have a team by this name",
            )

        """Create team, then set user as member"""
        team = Team.objects.create(founder=request.auth, name=data.name)
        team.agencies.set(data.agencies)
        TeamMember.objects.create(team=team, user=request.auth)
        return JsonResponse(status=status.HTTP_201_CREATED, data={"id": team.id})


@router.get("/team/{team_id}")
def get_team_info(request, team_id: PositiveInt):
    """
    :Access: All Users on designated team.

    Returns all info for specified team
    """
    user_in_team = TeamMember.objects.filter(
        user=request.auth, team__id=team_id
    ).exists()
    if not user_in_team:
        return HttpResponse(status=status.HTTP_401_UNAUTHORIZED)

    team = get_object_or_404(Team, id=team_id, disbanded_date=None)

    if request.auth == team.founder:
        return ElevatedSingleTeamSerializer(team).data
    return SingleTeamSerializer(team).data


@router.delete("/team/{team_id}")
def disband_team(request, team_id: PositiveInt):
    """
    :Access: Founders of a team

    Marks teams as deleted (soft) removing them from searches
    """
    team = get_object_or_404(
        Team, pk=team_id, founder=request.auth, disbanded_date=None
    )
    member = get_object_or_404(TeamMember, user=request.auth, leave_date=None)
    with transaction.atomic():
        now = timezone.now().date()
        team.disbanded_date = now
        team.save()
        member.leave_date = now
        member.save()
        return HttpResponse(status=status.HTTP_200_OK)


@router.patch("/team/{team_id}")
def update_team_name(request, team_id: PositiveInt, data: UpdateTeamSchema):
    team = get_object_or_404(
        Team, pk=team_id, founder=request.auth, disbanded_date=None
    )
    team.name = data.name
    team.save()

    return SingleTeamSerializer(team, read_only=True).data


@router.post("/team/{team_id}/invite")
def invite_user_to_team(request, team_id: PositiveInt, data: InviteUserToTeamSchema):
    """
    :Access: DataManagers

    Endpoint for Data Managers to Invite a user to their team.
    """
    # TODO: Limit to DataManager/Administrator role access
    # TODO: Prevent User from adding Self
    # TODO: Ensure User being added has one matching Agency to Team.
    with transaction.atomic():
        recipient = get_object_or_404(User, subject=data.subject)
        team = get_object_or_404(
            Team, founder=request.auth, id=team_id, disbanded_date=None
        )
        active_member = TeamMember.objects.filter(
            team=team, user=recipient, leave_date=None
        ).exists()
        if active_member:
            return HttpResponse(
                status=status.HTTP_409_CONFLICT,
                content="User already member of team.",
            )
        TeamInvitation.objects.update_or_create(recipient=recipient, team=team)
        return HttpResponse(status=status.HTTP_201_CREATED)


##############
# Team Invitation Handling
###


@router.get("/invite", response={200: List[Dict]})
def get_active_invitations(request):
    """
    :Access: All users

    Get list of active PENDING invitations awaiting a user.
    """
    active_invites = TeamInvitation.objects.filter(
        recipient=request.auth,
        status=InviteStatus.Pending.value,
        team__disbanded_date=None,
    )
    return UserTeamInvitationSerializer(active_invites, many=True).data


@router.patch("/invite")
def user_response_to_invitation(request, data: InvitationResponseSchema):
    """
    :Access: Recipient of invite.

    Update invitation to reflect users Response. Adds user to team if accepted.
    """
    with transaction.atomic():
        invite = get_object_or_404(
            TeamInvitation,
            (Q(recipient=request.auth) | Q(team__founder=request.auth)),
            id=data.invitation_id,
            status=InviteStatus.Pending.value,
        )
        is_recipient = invite.recipient == request.auth
        is_founder = invite.team.founder == request.auth

        recipient_allowed = [InviteStatus.Accepted.value, InviteStatus.Declined.value]
        founder_allowed = [InviteStatus.Pending.value]

        invalid_recipient_action = is_recipient and (
            data.response not in recipient_allowed
        )
        invalid_founder_action = is_founder and (data.response not in founder_allowed)

        if invalid_recipient_action or invalid_founder_action:
            return HttpResponse(
                f"Not authorized to use status '{data.response}' for this invitation.",
                status=status.HTTP_400_BAD_REQUEST,  # 400 for bad action payload
            )

        invite.status = data.response
        invite.save()
        if data.response == InviteStatus.Accepted.value:
            TeamMember.objects.create(team=invite.team, user=invite.recipient)

        return HttpResponse(status.HTTP_201_CREATED)
