import datetime
from typing import List

from ninja import ModelSchema, Schema
from pydantic import ConfigDict, UUID4

from api.models.activity import Activity


class ActivityMinimal(Schema):
    """
    Minimal fields - shared between all representations
    """

    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: UUID4
    short_id: str
    date: datetime.date
    type: str  # @todo restrict via literal
    subtype: str  # @todo restrict via literal


class ActivitySearchParameters(Schema):
    """
    An object representing activity search parameters
    """

    date_from: datetime.date | None
    date_to: datetime.date | None


class ActivitySearchResult(Schema):
    items: List[ActivityMinimal]
    search: ActivitySearchParameters


class ActivityOut(ModelSchema):
    class Meta:
        model = Activity
        exclude = ("shape",)
