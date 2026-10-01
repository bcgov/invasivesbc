from typing import List, Optional
from datetime import date, datetime
from ninja import ModelSchema, Schema
from pydantic import Field, AliasPath
from api.models.teams import Team, TeamMember, TeamInvitation, InviteStatus


class TeamMemberOut(ModelSchema):
    subject: str = Field(..., validation_alias=AliasPath("user", "subject"))
    name: str = Field(..., validation_alias=AliasPath("user", "display_name"))
    leave_date: Optional[date] = None
    join_date: date

    class Meta:
        model = TeamMember
        fields = ["join_date", "leave_date"]


class InvitationOut(ModelSchema):
    id: int = Field(..., validation_alias=AliasPath("id"))
    date_stamp: datetime
    status: InviteStatus
    founder: str = Field(
        ..., validation_alias=AliasPath("team", "founder", "display_name")
    )
    name: str = Field(..., validation_alias=AliasPath("team", "name"))
    invitee: str = Field(..., validation_alias=AliasPath("recipient", "display_name"))
    agencies: str
    name: str = Field(..., validation_alias=AliasPath("team", "name"))
    founding_date: date = Field(
        ..., validation_alias=AliasPath("team", "founding_date")
    )
    description: str = Field(..., validation_alias=AliasPath("team", "description"))

    class Meta:
        model = TeamInvitation
        fields = [
            "date_stamp",
            "id",
            "status",
        ]

    @staticmethod
    def resolve_agencies(obj) -> str:
        return ", ".join([agency.full for agency in obj.team.agencies.all()])


class SingleTeamOut(ModelSchema):
    agencies: str
    members: List[TeamMemberOut]
    can_edit: bool
    founder: str = Field(..., validation_alias=AliasPath("founder", "display_name"))
    invitations: Optional[List[InvitationOut]] = None

    class Meta:
        model = Team
        fields = [
            "name",
            "founding_date",
            "id",
            "description",
        ]

    @staticmethod
    def resolve_agencies(obj) -> str:
        return ", ".join([agency.full for agency in obj.agencies.all()])

    @staticmethod
    def resolve_members(obj) -> List[TeamMemberOut]:
        return TeamMember.objects.filter(team=obj, leave_date=None)

    @staticmethod
    def resolve_can_edit(obj, context) -> bool:
        """
        Only trigger edit flags for Team Leaders.
        """
        return context["request"].auth == obj.founder

    @staticmethod
    def resolve_invitations(obj, context):
        """
        Add Invitation details only if requestee is team founder
        """
        if context["request"].auth != obj.founder:
            return None
        return TeamInvitation.objects.filter(team=obj).order_by("-date_stamp")


class TeamMembershipRowOut(ModelSchema):
    team_founder: str = Field(
        ..., validation_alias=AliasPath("team", "founder", "display_name")
    )
    team_name: str = Field(..., validation_alias=AliasPath("team", "name"))
    team_id: int = Field(..., validation_alias=AliasPath("team", "id"))
    description: str = Field(..., validation_alias=AliasPath("team", "description"))

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
    def resolve_can_create_team(obj, context):
        # TODO: Return 'roles includes DataManager'
        return context["request"].auth != None


class TeamSuggestedUserOut(Schema):
    code: str = Field(..., validation_alias="subject")
    full_name: str = Field(..., validation_alias="display_name")

    class Config:
        from_attributes = True
