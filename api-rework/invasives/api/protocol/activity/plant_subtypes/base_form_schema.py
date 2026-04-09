from typing import List, Union, TypedDict, Optional
from ninja import Schema
from pydantic import Field, model_validator
from pydantic_geojson import PointModel, FeatureModel, PolygonModel, MultiPolygonModel
from api.models.activity import FormStatus

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
    jurisdiction: str = Field(...)
    percent_covered: int = Field(..., ge=0, le=100)


class Participant(CleanSchema):
    name: str = Field(...)
    pac_number: Optional[int] = None


class Employer(TypedDict):
    employer: str


class LinkedActivity(TypedDict):
    label: str
    full: str


class FundingAgency(TypedDict):
    invasive_species_agency_code: str


class Media(TypedDict):
    description: str
    encoded_file: str


class ProjectCode(TypedDict):
    description: str


class BaseFormSchema(CleanSchema):
    id: Optional[str] = None  # Optional for first entries, required for updating.
    access_description: Optional[str] = None
    area_m: int = Field(..., gt=0, le=MAX_AREA_FOR_RECORD)
    comment: Optional[str] = None
    created_by: str = Field(...)
    date: str = Field(...)
    employer: List[Employer] = Field(..., min_length=1)
    funding_agencies: List[FundingAgency] = Field(..., min_length=1)
    form_status: Optional[FormStatus] = None
    geom: Union[PointModel, FeatureModel, PolygonModel, MultiPolygonModel] = Field(...)
    jurisdictions: List[JurisdictionSchema] = Field(..., min_length=1)
    latitude: float = Field(...)
    linked_activities: List[LinkedActivity]
    location_description: str = Field(..., min_length=10)
    longitude: float = Field(...)
    media: List[Media]
    participants: List[Participant] = Field(..., min_length=1)
    projects: List[ProjectCode]
    utm_easting: int = Field(...)
    utm_northing: int = Field(...)
    utm_zone: int = Field(...)
