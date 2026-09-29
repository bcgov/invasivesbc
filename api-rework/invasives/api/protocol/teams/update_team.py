from ninja import Schema
from pydantic import Field
from typing import Optional


class UpdateTeamSchema(Schema):
    """
    Schema for Updating a Team. Presently teams can only update their name.
    Agencies are locked to creation of Team.
    """

    name: Optional[str] = Field(max_length=128)
    description: Optional[str] = Field(max_length=256)
