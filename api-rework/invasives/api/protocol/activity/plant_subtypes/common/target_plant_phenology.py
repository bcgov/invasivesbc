from api.protocol.activity.plant_subtypes.base_form_schema import CleanSchema
from pydantic import model_validator, Field
from typing import Optional, List


class DraftPlantHeight(CleanSchema):
    height_cm: Optional[int]


class PlantHeight(CleanSchema):
    height_cm: int = Field(..., gt=1)


class DraftTargetPlantPhenology(CleanSchema):
    winter_dormant: Optional[int]
    seedlings: Optional[int]
    rosettes: Optional[int]
    bolts: Optional[int]
    flowering: Optional[int]
    seeds_forming: Optional[int]
    senescent: Optional[int]
    target_plant_heights: List[DraftPlantHeight] = None


class TargetPlantPhenology(DraftTargetPlantPhenology):
    winter_dormant: int = Field(..., ge=0, le=100)
    seedlings: int = Field(..., ge=0, le=100)
    rosettes: int = Field(..., ge=0, le=100)
    bolts: int = Field(..., ge=0, le=100)
    flowering: int = Field(..., ge=0, le=100)
    seeds_forming: int = Field(..., ge=0, le=100)
    senescent: int = Field(..., ge=0, le=100)
    target_plant_heights: List[PlantHeight] = None

    @model_validator(mode="after")
    def validate_sum_percentages(self) -> "TargetPlantPhenology":
        stages = [
            self.winter_dormant,
            self.seedlings,
            self.rosettes,
            self.bolts,
            self.flowering,
            self.seeds_forming,
            self.senescent,
        ]
        total = sum(stages)
        if total != 100:
            raise ValueError(f"Sum of fields must equal 100% (Current: {total})")
        return self
