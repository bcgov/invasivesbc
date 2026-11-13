import uuid
from ninja import Schema
from typing import Optional, List
from api.protocol.activity.activity_plant_row_out import (
    ActivityPlantRowOut,
    DraftActivityPlantRowOut,
)


class RecordsetRowsResponseOut(Schema):
    total: int
    entries: Optional[
        List[ActivityPlantRowOut] | List[DraftActivityPlantRowOut] | List[uuid.UUID]
    ]
