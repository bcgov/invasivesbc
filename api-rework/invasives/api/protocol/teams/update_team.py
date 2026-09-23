from ninja import Schema
from pydantic import Field


class UpdateTeamSchema(Schema):
    """
    Schema for Updating a Team. Presently teams can only update their name.
    Agencies are locked to creation of Team.
    """

    name: str = Field(max_length=128)
