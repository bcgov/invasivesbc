from ninja import Schema
from typing import List
from pydantic import Field, ConfigDict
from api.protocol.activity.validators.code_validation import FundingAgencyCodeType


class FundingAgency(Schema):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    """Single Funding Agency Entry, Casts alias to match the incoming payload to the db column"""

    agency: FundingAgencyCodeType


class CreateTeamSchema(Schema):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    name: str
    agencies: List[FundingAgency] = Field(min_length=1)
