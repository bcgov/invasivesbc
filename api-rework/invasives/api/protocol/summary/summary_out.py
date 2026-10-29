from ninja import Schema
from typing import List, Optional
from pydantic import Field, ConfigDict, field_validator
from api.protocol.activity.validators.code_validation import FundingAgencyCodeType


class SummaryOut(Schema):
    zone: Optional[List[str]] = None

    @field_validator("zone", mode="before")
    @classmethod
    def split_zone(cls, v):
        if isinstance(v, str):
            return v.split(",")
        return v
