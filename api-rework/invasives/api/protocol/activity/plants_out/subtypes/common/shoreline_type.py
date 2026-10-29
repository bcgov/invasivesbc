from typing import Optional
from api.models.activity import ShorelineTypes, DraftShorelineTypes
from ninja import Schema

type Shoreline = ShorelineTypes | DraftShorelineTypes


class ShorelineType(Schema):
    shoreline_type: Optional[str]
    percent_covered: Optional[int]

    @staticmethod
    def resolve_shoreline_type(obj: ShorelineTypes):
        return obj.shoreline_type.code if obj.shoreline_type else None
