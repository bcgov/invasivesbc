from ninja import Schema
from typing import List, Optional
from pydantic import Field, ConfigDict, field_validator
from api.protocol.activity.validators.code_validation import FundingAgencyCodeType


class SummaryIn(Schema):
    zone: Optional[List[str]] = None

    @field_validator("zone", mode="before")
    @classmethod
    def split_zone(cls, v):
        # If it's a list, look inside and parse its items
        if isinstance(v, list):
            result = []
            for item in v:
                if isinstance(item, str):
                    # Split comma strings and extend
                    result.extend([z.strip() for z in item.split(",") if z.strip()])
                else:
                    result.append(item)
            return result

        # if it arrives directly as a raw string
        if isinstance(v, str):
            return [z.strip() for z in v.split(",") if z.strip()]

        return v
