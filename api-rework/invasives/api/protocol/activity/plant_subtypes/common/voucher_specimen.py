from api.protocol.activity.plant_subtypes.base_form_schema import CleanSchema
from pydantic import model_validator, field_validator, Field
from api.protocol.activity.validators.no_future_date import no_future_date
from typing import Optional
from datetime import date


class DraftVoucherSpecimen(CleanSchema):
    voucher_sample_id: str
    herbarium: Optional[str] = None
    accession_number: Optional[str] = None
    completed_by_person: Optional[str] = None
    completed_by_org: Optional[str] = None
    utm_zone: Optional[int]
    utm_easting: Optional[int]
    utm_northing: Optional[int]
    date_collected: Optional[date]
    date_verified: Optional[date] = None


class VoucherSpecimenSchema(DraftVoucherSpecimen):
    voucher_sample_id: str
    utm_zone: int = Field(..., gt=0)
    utm_easting: int = Field(..., gt=0)
    utm_northing: int = Field(..., gt=0)
    date_collected: date

    @field_validator("date_collected")
    @classmethod
    def no_future_collection_date(cls, v):
        return no_future_date(v)

    @field_validator("date_verified")
    @classmethod
    def no_future_activity_date(cls, v):
        return no_future_date(v)

    @model_validator(mode="after")
    def sequential_dates(self):
        if (
            self.date_collected
            and self.date_verified
            and self.date_collected > self.date_verified
        ):
            raise ValueError("The end date must follow the start date")
        return self
