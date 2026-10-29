from ninja import Schema
from typing import Optional, List
from api.models.activity import (
    Activity,
    DraftActivity,
    SpreadResults,
    DraftSpreadResults,
)

type Phenology = SpreadResults | DraftSpreadResults


class SpreadResultsOut(Schema):
    agent_density: Optional[int]
    plant_attack: Optional[int]
    max_spread_distance_m: Optional[int]
    max_spread_aspect_deg: Optional[int]


class SpreadResultsOutMixin(Schema):
    spread_results: Optional[SpreadResultsOut]

    @staticmethod
    def resolve_spread_results(obj: Activity) -> DraftSpreadResults:
        return SpreadResults.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()


class DraftSpreadResultsOutMixin(SpreadResultsOutMixin):

    @staticmethod
    def resolve_spread_results(obj: DraftActivity) -> DraftSpreadResults:
        return DraftSpreadResults.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
