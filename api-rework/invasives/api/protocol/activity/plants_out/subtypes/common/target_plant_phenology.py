from ninja import Schema
from typing import Optional, List
from api.models.activity import (
    Activity,
    TargetPlantPhenology,
    DraftTargetPlantPhenology,
    TargetPlantHeights,
    DraftTargetPlantHeights,
)

type Phenology = TargetPlantPhenology | DraftTargetPlantPhenology


class TargetPlantHeight(Schema):
    height_cm: Optional[int]


class TargetPlantPhenologyOut(Schema):
    winter_dormant: Optional[int]
    seedlings: Optional[int]
    rosettes: Optional[int]
    bolts: Optional[int]
    flowering: Optional[int]
    seeds_forming: Optional[int]
    senescent: Optional[int]
    target_plant_heights: List[TargetPlantHeight]

    @staticmethod
    def resolve_target_plant_heights(obj: Phenology):
        return TargetPlantHeights.objects.filter(
            activity_data_record=obj.activity_data_record
        )


class DraftTargetPlantPhenologyOut(TargetPlantPhenologyOut):
    @staticmethod
    def resolve_target_plant_heights(obj: Phenology):
        return DraftTargetPlantHeights.objects.filter(
            activity_data_record=obj.activity_data_record
        )


class TargetPlantPhenologyOutMixin(Schema):
    target_plant_phenology: Optional[TargetPlantPhenologyOut]

    @staticmethod
    def resolve_target_plant_phenology(obj: Activity):
        return TargetPlantPhenology.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()


class DraftTargetPlantPhenologyOutMixin(TargetPlantPhenologyOutMixin):
    target_plant_phenology: Optional[DraftTargetPlantPhenologyOut]

    @staticmethod
    def resolve_target_plant_phenology(obj: Activity):
        return DraftTargetPlantPhenology.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
