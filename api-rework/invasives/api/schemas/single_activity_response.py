from api.protocol.activity.plant_subtypes.union_definition import PlantActivitySchema
from typing import List
from ninja import Schema
from enum import Enum


class RecordAction(str, Enum):
    EDIT = "EDIT"
    DELETE = "DELETE"
    SUBMIT = "SUBMIT"


class SingleActivityResponse(Schema):
    data: PlantActivitySchema
    available_actions: List[RecordAction]
