from ninja import Schema
from typing import List
from pydantic import Field, ConfigDict
from api.protocol.activity.validators.code_validation import FundingAgencyCodeType


class CreateTeamSchema(Schema):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    name: str
    agencies: List[FundingAgencyCodeType] = Field(min_length=1)
