from ninja import Schema, Field
from typing import Optional


class HerbicideOut(Schema):
    type: Optional[str]
    name: Optional[str]
    application_rate: Optional[float] = Field(..., alias="product_application_rate")

    @staticmethod
    def resolve_name(obj):
        return obj.name.code if obj.name else None

    @staticmethod
    def resolve_type(obj):
        return obj.type.code if obj.type else None
