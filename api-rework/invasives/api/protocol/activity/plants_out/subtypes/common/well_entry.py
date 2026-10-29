from ninja import Schema
from typing import Optional


class WellEntryOut(Schema):
    well_tag: Optional[str]
    distance: Optional[float]
