from ninja import Schema, Field
from typing import List, Optional
from datetime import datetime
from . import PlantRecordOut, RecordHistoryOut, AllPlantMixin

from api.models.activity import Activity, DraftActivity
from api.protocol.activity.activity_plant_row_out import ActivityPlantRowOut
from api.models.audits import ActivityModificationRecord
from api.schemas import RecordAction
from api.permissions.activity_access import filter_activities_by_access

type Record = Activity | DraftActivity


class Metadata(AllPlantMixin, Schema):
    history: List[RecordHistoryOut]
    created_date: datetime = Field(..., alias="created_timestamp")
    batch_id: Optional[int]
    linking_activities: List[ActivityPlantRowOut]

    @staticmethod
    def resolve_history(obj: Record) -> List[RecordHistoryOut]:
        if isinstance(obj, DraftActivity):
            return []
        return ActivityModificationRecord.objects.filter(activity=obj).order_by("-date")

    @staticmethod
    def resolve_linking_activities(obj: Record, context) -> List[ActivityPlantRowOut]:
        if isinstance(obj, DraftActivity):
            return []
        return filter_activities_by_access(
            obj.activity_set.all(),
            context["request"].auth,
        ).order_by("-date")


class PlantRecordWithMetadataOut(Schema):
    available_actions: List[RecordAction]
    metadata: Metadata
    data: PlantRecordOut

    @staticmethod
    def resolve_data(obj: Record) -> Record:
        return obj

    @staticmethod
    def resolve_metadata(obj: Record) -> Record:
        return obj

    @staticmethod
    def resolve_available_actions(obj) -> List[RecordAction]:
        return [*RecordAction]
