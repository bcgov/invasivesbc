from typing import List, Literal, Optional
from datetime import date
from ninja import Schema
from pydantic import Field, model_validator, field_validator, RootModel, ConfigDict
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
    Base class inherited by all Sub Schema types.
    Cleans up any incoming data before validation occurs by setting empty strings to None values.
    """

    model_config = ConfigDict(arbitrary_types_allowed=True)

    class Meta:
        abstract = True

    @model_validator(mode="before")
    @classmethod
    def remove_empty_strings(cls, values):
        # If it's a dictionary payload (normal use-case)
        if isinstance(values, dict):
            for field_name in cls.model_fields:
                if values.get(field_name) == "":
                    values[field_name] = None

        # If it's already an instantiated object or arbitrary type
        elif hasattr(values, "__dict__"):
            for field_name in cls.model_fields:
                if getattr(values, field_name, None) == "":
                    setattr(values, field_name, None)

        return values


class DraftJurisdictionSchema(CleanSchema):
    jurisdiction: Optional[JurisdictionCodeType]
    percent_covered: Optional[int]


class JurisdictionSchema(DraftJurisdictionSchema):
    jurisdiction: JurisdictionCodeType
    percent_covered: int = Field(..., ge=0, le=100)


class DraftParticipant(CleanSchema):
    name: Optional[str] = None
    pac_number: Optional[int] = None


class Participant(DraftParticipant):
    name: str


class Employer(CleanSchema):
    employer: EmployerCodeType


class LinkedActivity(CleanSchema):
    label: str
    full: str


class FundingAgency(CleanSchema):
    """Single Funding Agency Entry, Casts alias to match the incoming payload to the db column"""

    agency: FundingAgencyCodeType = Field(..., alias="invasive_species_agency_code")


class Media(CleanSchema):
    """Single Media Entry (Photo Upload) for Plant Activity Forms"""

    description: str
    encoded_file: str
    file_name: str


class ProjectCode(CleanSchema):
    description: str


class Position2D(RootModel[tuple[float, float]]):
    """Loosely defined coordinate type for incoming Geometry"""

    pass


class PolygonGeometry2D(CleanSchema):
    """
    Custom Polygon GeoJSON Type.
    Pydantics build in Geometry types add 0-value Z-indexes that error out when casting to GeosGeometry.
    """

    type: Literal["Polygon"]
    coordinates: list[list[Position2D]]


class Feature2D(CleanSchema):
    """
    Custom 2D GeoJSON Feature type.
    Pydantics build in Geometry types add 0-value Z-indexes that error out when casting to GeosGeometry.
    """

    type: Literal["Feature"]
    geometry: PolygonGeometry2D
    properties: dict | None = None


class DraftBaseFormSchema(CleanSchema):
    """Loosely Typed BaseSchema for Plant Activity Forms"""

    # Identifying Information (Subtype defined by the Inheriting Classes)
    date: date
    id: str
    created_by: str
    # Should only accept drafts, not submissions.
    form_status: Literal[FormStatus.Draft]
    linked_activities: List[LinkedActivity]
    employer: List[Employer]
    funding_agencies: List[FundingAgency]
    jurisdictions: List[DraftJurisdictionSchema]
    media: List[Media]
    participants: List[DraftParticipant]
    projects: List[ProjectCode]

    # Geometry Values
    area_m: Optional[int]
    shape: Optional[Feature2D] = None
    latitude: Optional[float]
    longitude: Optional[float]
    utm_easting: Optional[int]
    utm_northing: Optional[int]
    utm_zone: Optional[int]

    # Top-level Comments
    access_description: Optional[str]
    comment: Optional[str]
    location_description: Optional[str]

    class Meta:
        abstract = True


class BaseFormSchema(DraftBaseFormSchema):
    """Strictly Typed BaseSchema for Plant Activity Forms"""

    linked_activities: List[LinkedActivity]
    employer: List[Employer] = Field(..., min_length=1)
    form_status: FormStatus
    funding_agencies: List[FundingAgency] = Field(..., min_length=1)
    jurisdictions: List[JurisdictionSchema] = Field(..., min_length=1)
    participants: List[Participant] = Field(..., min_length=1)
    area_m: int = Field(..., gt=0, le=MAX_AREA_FOR_RECORD)
    shape: Feature2D
    latitude: float
    longitude: float
    utm_easting: int
    utm_northing: int
    utm_zone: int
    location_description: str = Field(..., min_length=5)

    class Meta:
        abstract = True

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
