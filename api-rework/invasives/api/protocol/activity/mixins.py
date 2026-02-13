import decimal

from pydantic import BaseModel, Field, field_validator
from pydantic_extra_types.coordinate import Latitude, Longitude, Coordinate
from pydantic_geojson import FeatureModel


class BaseCode(BaseModel):
    code: str = Field()
    full: str = Field()


class JurisdictionDetails(BaseModel):
    name: str = Field()
    coverage: float | int = Field()


class ParticipantDetails(BaseModel):
    name: str = Field()


class EmployerDetails(BaseModel):
    name: str = Field()


class FundingAgencyDetails(BaseModel):
    invasive_species_agency_code: str = Field()


class LocationDetails(BaseModel):
    utm_zone: int = Field()
    utm_northing: int = Field()
    utm_easting: int = Field()
    area_square_meters: decimal.Decimal = Field()
    latitude: Latitude = Field()
    longitude: Longitude = Field()
    shape: FeatureModel = Field()
    centroid: Coordinate = Field()
