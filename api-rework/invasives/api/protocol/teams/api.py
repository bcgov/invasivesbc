from ninja import Router
from django.db import transaction
from django.db.models import Q
from typing import List
from pydantic import PositiveInt
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from api.ninja_authentication import NinjaKeycloakAuthentication
from api.models.teams import TeamMember, Team, InviteStatus, TeamInvitation
from api.models.auth import User
from api.schemas.teams import (
    InvitationOut,
    SingleTeamOut,
    TeamMembershipOut,
    TeamSuggestedUserOut,
)
from rest_framework import status
from . import (
    CreateTeamSchema,
    UpdateTeamSchema,
    InviteUserToTeamSchema,
    InvitationResponseSchema,
)

ROOT_PATH = "/teams"
router = Router(auth=NinjaKeycloakAuthentication())


##############
# Team Creation Handling
###


@router.get("/team", response={200: TeamMembershipOut})
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
    return {"teams": user_teams}


@router.post("/team", response={201: dict})
def create_team(request, data: CreateTeamSchema):
    """
    :Access: DataManagers

    Endpoint for Data Managers to create a new team. Requesting user is auto-enlisted into team.
    """
    with transaction.atomic():
        # TODO: Limit to DataManager/Administrator role access
        if Team.objects.filter(founder=request.auth, name=data.name).exists():
            return JsonResponse(
                status=status.HTTP_409_CONFLICT,
                data={"details": "You already have a team by this name"},
            )

        """Create team, then set user as member"""
        team = Team.objects.create(
            founder=request.auth, name=data.name, description=data.description
        )
        team.agencies.set(data.agencies)
        TeamMember.objects.create(team=team, user=request.auth)
        return JsonResponse(status=status.HTTP_201_CREATED, data={"id": team.id})


@router.get("/team/{team_id}", response={200: SingleTeamOut, 403: dict})
def get_team_info(request, team_id: PositiveInt):
    """
    :Access: All Users on designated team.

    Returns all info for specified team
    """
    user_in_team = TeamMember.objects.filter(
        user=request.auth, team__id=team_id
    ).exists()
    if not user_in_team:
        return JsonResponse(
            status=status.HTTP_403_FORBIDDEN,
            data={"detail": "Not a member of this team"},
        )

    return get_object_or_404(Team, id=team_id, disbanded_date=None)


@router.delete("/team/{team_id}", response={200: None})
def disband_team(request, team_id: PositiveInt):
    """
    :Access: Founders of a team

    Marks teams as deleted (soft) removing them from searches
    """
    team = get_object_or_404(
        Team, pk=team_id, founder=request.auth, disbanded_date=None
    )
    member = get_object_or_404(
        TeamMember, user=request.auth, leave_date=None, team=team
    )
    with transaction.atomic():
        now = timezone.now().date()
        team.disbanded_date = now
        team.save(update_fields=["disbanded_date"])
        member.leave_date = now
        member.save(update_fields=["leave_date"])
        return HttpResponse(status=status.HTTP_200_OK)


@router.patch("/team/{team_id}", response={200: SingleTeamOut, 409: dict})
def update_team_metadata(request, team_id: PositiveInt, data: UpdateTeamSchema):
    """
    :Access: Data Managers

    Update Description/Name of a team.
    """
    team = get_object_or_404(
        Team, pk=team_id, founder=request.auth, disbanded_date=None
    )
    if (
        Team.objects.filter(founder=request.auth, name=data.name)
        .exclude(id=team_id)
        .exists()
    ):
        return JsonResponse(
            status=status.HTTP_409_CONFLICT,
            data={"details": "You already have a team by this name"},
        )
    update_data = {
        k: v
        for k, v in data.model_dump(exclude_unset=True).items()
        if v != "" and v is not None
    }
    for key, value in update_data.items():
        setattr(team, key, value)
    team.save(update_fields=list(update_data.keys()))

    return team


@router.post("/team/{team_id}/invite", response={201: dict, 409: dict})
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
        _, created = TeamInvitation.objects.update_or_create(
            recipient=recipient, team=team, defaults={"status": InviteStatus.Pending}
        )
        status_code = status.HTTP_201_CREATED if created else status.HTTP_204_NO_CONTENT
        return HttpResponse(status=status_code)


##############
# Team Invitation Handling
###


@router.get("/team/{team_id}/invite", response={200: List[TeamSuggestedUserOut]})
def get_suggested_users(request, team_id):
    """
    :Access: Team Founders

    Get List of Suggestions based on the Agency list of a team.
    """
    # TODO: Implement Agency Filter when old auth ported over.
    team = get_object_or_404(Team, id=team_id)
    if team.founder != request.auth:
        return HttpResponse(status=status.HTTP_401_UNAUTHORIZED)

    members = TeamMember.objects.filter(team=team, leave_date=None).values_list(
        "user__subject", flat=True
    )
    suggestions = (
        User.objects.filter(
            # agencies__in=team.agencies  # Filter Agencies
        )
        .exclude(subject__in=members)  # Remove existing team members
        .order_by("display_name")
    )
    return suggestions


@router.get("/invite", response={200: List[InvitationOut]})
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
    return active_invites


@router.patch("/invite", response={201: None, 403: dict})
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
        founder_allowed = [InviteStatus.Pending.value, InviteStatus.Cancelled.value]

        invalid_recipient_action = is_recipient and (
            data.response not in recipient_allowed
        )
        invalid_founder_action = is_founder and (data.response not in founder_allowed)

        if invalid_recipient_action or invalid_founder_action:
            return JsonResponse(
                data={
                    "details": f"Not authorized to use status '{data.response}' for this invitation."
                },
                status=status.HTTP_400_BAD_REQUEST,  # 400 for bad action payload
            )

        invite.status = data.response
        invite.save()
        if data.response == InviteStatus.Accepted.value:
            TeamMember.objects.update_or_create(
                team=invite.team, user=invite.recipient, defaults={"leave_date": None}
            )

        return HttpResponse(status.HTTP_201_CREATED)


@router.delete("/team/{team_id}/leave", response={204: None})
def leave_team(request, team_id: int):
    """
    :Access: All users
    Requesting user is removed from the team
    """
    team = get_object_or_404(
        TeamMember,
        user=request.auth,
        leave_date=None,
        team__id=team_id,
    )
    team.leave_date = timezone.now()
    team.save(update_fields=["leave_date"])
    return HttpResponse(status=status.HTTP_204_NO_CONTENT)


@router.delete("/team/{team_id}/members/{subject}", response={204: None})
def kick_member(request, team_id: int, subject: str):
    """
    :Access: Data Managers

    Data manager selects user to remove from the team.
    """
    team = get_object_or_404(
        TeamMember,
        user__subject=subject,
        leave_date=None,
        team__id=team_id,
        team__founder=request.auth,
    )
    team.leave_date = timezone.now()
    team.save(update_fields=["leave_date"])
    return HttpResponse(status=status.HTTP_204_NO_CONTENT)
