from ninja import Schema
from typing import Optional
from pydantic import Field, ConfigDict
from api.models.enums import PlatformSource
from api.protocol.activity.validators.code_validation import BugReportTypeCodeType


class CreateBugReportInSchema(Schema):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    device: PlatformSource
    description: str = Field(max_length=8192)
    title: str = Field(max_length=100)
    reproducible: bool
    expected_behavior: Optional[str] = Field(max_length=8192)
    offline: bool
    online: bool
    issue_type: BugReportTypeCodeType
