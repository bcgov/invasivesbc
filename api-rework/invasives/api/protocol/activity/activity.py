import datetime
from typing import Literal, List, Optional

from pydantic import BaseModel, Field, UUID4

from .mixins import (
    LocationDetails,
    ParticipantDetails,
    JurisdictionDetails,
    EmployerDetails,
    BaseCode,
)


class ActivityMinimal(BaseModel):
    """
    Minimal fields - shared between all representations
    """

    id: UUID4
    short_id: str
    date: datetime.date
    type: str  # @todo restrict via literal
    subtype: str  # @todo restrict via literal


class ActivityShallow(ActivityMinimal, BaseModel):
    """
    For list views - minimal representation
    """

    pass


class ActivityDeep(ActivityMinimal, BaseModel):
    form_status: Literal["submitted", "deleted", "draft"]
    comment: str = Field(default=None)
    access_description: str
    created_by: str

    location: LocationDetails
    participants: List[ParticipantDetails]
    employer: List[EmployerDetails]
    jurisdictions: List[JurisdictionDetails]
    linked_activities: List[UUID4]


class SiteDetails(BaseModel):
    aspect: BaseCode
    slope: BaseCode
    soil_texture: BaseCode
    specific_use: List[BaseCode]


class ObservationDetails(BaseModel):
    suitable_for_biocontrol_agent: Literal["Yes", "No", "Unknown"]
    pre_treatment_observation: Literal["Yes", "No", "Unknown"]
    research_observation: Literal["Yes", "No"]
    visible_well_nearby: Literal["Yes", "No"]


class ActivityDeepPlantObservationTerrestrial(ActivityDeep, BaseModel):
    """
    For read-only views of the deep object structure
    """

    type: Literal["Observation"]  # override the base class
    subtype: Literal["Plant - Terrestrial"]

    site_details: SiteDetails
    observation_details: ObservationDetails
