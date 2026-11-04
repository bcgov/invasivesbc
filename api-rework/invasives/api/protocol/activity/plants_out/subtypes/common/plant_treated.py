from typing import Optional
from api.models.activity import Activity, DraftActivity
from ninja import Schema

type Record = Activity | DraftActivity


class PlantTreatedOut(Schema):
    percent_covered: Optional[int]
    invasive_plant: Optional[str]

    @staticmethod
    def resolve_invasive_plant(obj):
        return obj.invasive_plant.code if obj.invasive_plant else None
