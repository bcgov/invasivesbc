import datetime
from typing import Optional
from ninja import Schema


class VoucherSpecimenOut(Schema):
    voucher_sample_id: Optional[str]
    herbarium: Optional[str]
    accession_number: Optional[str]
    date_collected: Optional[datetime.date]
    date_verified: Optional[datetime.date]
    completed_by_person: Optional[str]
    completed_by_org: Optional[str]
    utm_zone: Optional[int]
    utm_easting: Optional[int]
    utm_northing: Optional[int]
