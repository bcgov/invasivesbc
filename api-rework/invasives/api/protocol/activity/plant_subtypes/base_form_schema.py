from typing import List, Union, Optional
from datetime import date
from ninja import Schema
from pydantic import Field, model_validator, field_validator
from pydantic_geojson import PointModel, FeatureModel, PolygonModel, MultiPolygonModel
from api.models.activity import FormStatus
from api.protocol.activity.validators.no_repeat_key import no_repeat_key
from api.protocol.activity.validators.check_sum import check_sum
from api.protocol.activity.validators.no_future_date import no_future_date
from api.protocol.activity.validators.code_validation import (
    EmployerCodeType,
    JurisdictionCodeType,
    FundingAgencyCodeType,
)

MAX_AREA_FOR_RECORD = 500000


class CleanSchema(Schema):
    """
    Cleanup method to set all Empty strings in form to None
    """

    @model_validator(mode="before")
    def remove_empty_strings(cls, values):
        # Convert empty string fields to None
        for f in cls.__pydantic_fields__:
            if getattr(values, f, None) == "":
                setattr(values, f, None)
        return values


class JurisdictionSchema(CleanSchema):
    jurisdiction: JurisdictionCodeType
    percent_covered: int = Field(..., ge=0, le=100)


class Participant(CleanSchema):
    name: str
    pac_number: Optional[int] = None


class Employer(CleanSchema):
    employer: EmployerCodeType


class LinkedActivity(CleanSchema):
    label: str
    full: str


class FundingAgency(CleanSchema):
    invasive_species_agency_code: FundingAgencyCodeType


class Media(CleanSchema):
    description: str
    encoded_file: str


class ProjectCode(CleanSchema):
    description: str


class BaseFormSchema(CleanSchema):
    # Identifying Information (Subtype defined in Inherited Classes)
    date: date
    id: Optional[str] = None  # Optional for first entries, required for updating.
    linked_activities: List[LinkedActivity]
    created_by: str
    employer: List[Employer] = Field(..., min_length=1)
    form_status: Optional[FormStatus] = None
    funding_agencies: List[FundingAgency] = Field(..., min_length=1)
    jurisdictions: List[JurisdictionSchema] = Field(..., min_length=1)
    media: List[Media]
    participants: List[Participant] = Field(..., min_length=1)
    projects: List[ProjectCode]

    # Geometry Values
    area_m: int = Field(..., gt=0, le=MAX_AREA_FOR_RECORD)
    shape: Union[PointModel, FeatureModel, PolygonModel, MultiPolygonModel]
    latitude: float
    longitude: float
    utm_easting: int
    utm_northing: int
    utm_zone: int

    # Top-level Comments
    access_description: Optional[str] = None
    comment: Optional[str] = None
    location_description: str = Field(..., min_length=5)

    @field_validator("date")
    @classmethod
    def no_future_activity_date(cls, v):
        return no_future_date(v)

    @field_validator("jurisdictions")
    @classmethod
    def unique_jurisdictions(cls, v):
        return no_repeat_key(v, key="jurisdiction", key_label="Jurisdiction")

    @field_validator("jurisdictions")
    @classmethod
    def jurisdiction_sum(cls, v):
        return check_sum(v, expected=100, key="percent_covered")
