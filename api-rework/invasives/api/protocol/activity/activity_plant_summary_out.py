from .activity_plant_row_out import ActivityPlantRowOut
from ninja import Schema
from typing import List
from django.db.models import QuerySet
from api.models.activity import ActivityType, Activity


class ActivityPlantSummaryOut(Schema):
    observations: List[ActivityPlantRowOut]
    treatments: List[ActivityPlantRowOut]
    monitoring: List[ActivityPlantRowOut]
    biocontrol: List[ActivityPlantRowOut]

    @staticmethod
    def _bucket(obj, activity_type: ActivityType):
        return [a for a in obj if a.type == activity_type.value]

    @staticmethod
    def resolve_observations(obj):
        return ActivityPlantSummaryOut._bucket(obj, ActivityType.Observation)

    @staticmethod
    def resolve_treatments(obj: QuerySet[Activity]):
        return ActivityPlantSummaryOut._bucket(obj, ActivityType.Treatment)

    @staticmethod
    def resolve_monitoring(obj: QuerySet[Activity]):
        return ActivityPlantSummaryOut._bucket(obj, ActivityType.Monitoring)

    @staticmethod
    def resolve_biocontrol(obj: QuerySet[Activity]):
        return ActivityPlantSummaryOut._bucket(obj, ActivityType.Biocontrol)
