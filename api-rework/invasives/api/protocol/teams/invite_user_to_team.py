from ninja import Schema
from pydantic import PositiveInt
from typing import Literal
from api.models.teams import InviteStatus


class InviteUserToTeamSchema(Schema):
    subject: str


class InvitationResponseSchema(Schema):
    invitation_id: PositiveInt
    response: Literal[InviteStatus.Accepted] | Literal[InviteStatus.Declined]
