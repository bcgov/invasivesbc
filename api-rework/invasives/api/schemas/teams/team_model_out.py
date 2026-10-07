from typing import List, Optional
from datetime import date, datetime
from ninja import ModelSchema, Schema
from pydantic import Field, AliasPath
from api.constants import WellKnownRoles
from api.models.teams import Team, TeamMember, TeamInvitation, InviteStatus


class TeamMemberOut(ModelSchema):
    join_date: date
    leave_date: Optional[date] = None
    name: str = Field(..., validation_alias=AliasPath("user", "display_name"))
    subject: str = Field(..., validation_alias=AliasPath("user", "subject"))

    class Meta:
        model = TeamMember
        fields = ["join_date", "leave_date"]


class InvitationOut(ModelSchema):
    id: int = Field(..., validation_alias=AliasPath("id"))

    agencies: Optional[str] = None
    date_stamp: datetime
    description: str = Field(..., validation_alias=AliasPath("team", "description"))
    employers: Optional[str] = None
    founder: str = Field(
        ..., validation_alias=AliasPath("team", "founder", "display_name")
    )
    founding_date: date = Field(
        ..., validation_alias=AliasPath("team", "founding_date")
    )
    invitee: str = Field(..., validation_alias=AliasPath("recipient", "display_name"))
    name: str = Field(..., validation_alias=AliasPath("team", "name"))
    status: InviteStatus

    class Meta:
        model = TeamInvitation
        fields = [
            "date_stamp",
            "id",
            "status",
        ]

    @staticmethod
    def resolve_agencies(obj) -> Optional[str]:
        return ", ".join([agency.full for agency in obj.team.agencies.all()]) or None

    @staticmethod
    def resolve_employers(obj) -> Optional[str]:
        return (
            ", ".join([employer.full for employer in obj.team.employers.all()]) or None
        )


class SingleTeamOut(ModelSchema):
    agencies: Optional[str]
    can_edit: bool
    employers: Optional[str]
    founder: str = Field(..., validation_alias=AliasPath("founder", "display_name"))
    invitations: Optional[List[InvitationOut]] = None
    members: List[TeamMemberOut]

    class Meta:
        model = Team
        fields = [
            "name",
            "founding_date",
            "id",
            "description",
        ]

    @staticmethod
    def resolve_agencies(obj) -> Optional[str]:
        return ", ".join([agency.full for agency in obj.agencies.all()]) or None

    @staticmethod
    def resolve_can_edit(obj, context) -> bool:
        """
        Only trigger edit flags for Team Leaders.
        """
        return context["request"].auth == obj.founder

    @staticmethod
    def resolve_employers(obj) -> Optional[str]:
        return ", ".join([employer.full for employer in obj.employers.all()]) or None

    @staticmethod
    def resolve_invitations(obj, context):
        """
        Add Invitation details only if requestee is team founder
        """
        if context["request"].auth != obj.founder:
            return None
        return TeamInvitation.objects.filter(team=obj).order_by("-date_stamp")

    @staticmethod
    def resolve_members(obj) -> List[TeamMemberOut]:
        return TeamMember.objects.filter(team=obj, leave_date=None)


class TeamMembershipRowOut(ModelSchema):
    description: str = Field(..., validation_alias=AliasPath("team", "description"))
    team_founder: str = Field(
        ..., validation_alias=AliasPath("team", "founder", "display_name")
    )
    team_name: str = Field(..., validation_alias=AliasPath("team", "name"))
    team_id: int = Field(..., validation_alias=AliasPath("team", "id"))

    class Meta:
        model = TeamMember
        fields = ["join_date"]


class TeamMembershipOut(Schema):
    """
    Returns Teams belonging to a User, includes permission to create a new team
    """

    can_create_team: bool
    teams: List[TeamMembershipRowOut]

    @staticmethod
    def resolve_can_create_team(_, context):
        return context["request"].auth.has_any_role(
            [
                WellKnownRoles.DATA_MANAGER.value,
                WellKnownRoles.ADMINISTRATOR.value,
            ]
        )


class TeamSuggestedUserOut(Schema):
    code: str = Field(..., validation_alias="subject")
    full_name: str = Field(..., validation_alias="display_name")

    class Config:
        from_attributes = True
