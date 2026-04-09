from ninja import Schema
from pydantic import Field


class VoucherSpecimenSchema(Schema):
    voucher_sample_id: str
    herbarium: str
    accession_number: str
    completed_by_person: str
    completed_by_org: str
    utm_zone: int = Field(...)
    utm_easting: int = Field(...)
    utm_northing: int = Field(...)
    date_collected: str = Field(...)
    date_verified: str
