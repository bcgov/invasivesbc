from typing import Literal

from pydantic import BaseModel, Field


class ActivitySearchRequest(BaseModel):
    ordering: Literal["date", ""] = Field()
