from ninja import Schema
from pydantic import PositiveInt
from api.models.teams import InviteStatus


class InviteUserToTeamSchema(Schema):
    subject: str


class InvitationResponseSchema(Schema):
    invitation_id: PositiveInt
    response: InviteStatus
