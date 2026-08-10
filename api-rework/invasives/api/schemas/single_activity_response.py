from api.protocol.activity.plant_subtypes.union_definition import PlantActivitySchema
from typing import List, Optional
from ninja import Schema
from enum import Enum


class RecordAction(str, Enum):
    EDIT = "EDIT"
    DELETE = "DELETE"
    SUBMIT = "SUBMIT"


class RecordMetadata(Schema):
    """Properties related to a record, but not directly affected by the record."""

    linking_activities: Optional[List[dict]]
    history: Optional[List[dict]]


class SingleActivityResponse(Schema):
    data: PlantActivitySchema
    available_actions: List[RecordAction]
    record_metadata: RecordMetadata
