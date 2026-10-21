from ninja import Schema
from typing import List, Optional
from pydantic import ConfigDict, Field
from api.protocol.activity.validators.code_validation import (
    EmployerCodeType,
    FundingAgencyCodeType,
    ServiceLicenseNumberAndCompanyType,
)


class UserAccessIn(Schema):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    employer: List[EmployerCodeType] = Field(..., min_length=1)
    funding_agencies: List[FundingAgencyCodeType] = Field(..., min_length=1)
    pac_number: Optional[int] = None
    pac_service_numbers: List[ServiceLicenseNumberAndCompanyType]
    phone: Optional[str]
    roles: List[str] = Field(..., min_length=1)

    comments: Optional[str] = Field(..., max_length=1048)
