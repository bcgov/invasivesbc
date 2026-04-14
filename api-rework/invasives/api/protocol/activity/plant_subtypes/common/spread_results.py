from api.protocol.activity.plant_subtypes.base_form_schema import CleanSchema
from pydantic import Field, model_validator
from typing import Optional


class SpreadResultsMixin(CleanSchema):
    agent_density: Optional[int] = Field(None, ge=0, le=100)
    plant_attack: Optional[int] = Field(None, ge=0, le=100)
    max_spread_distance_m: Optional[int] = Field(None, gt=0)
    max_spread_aspect_deg: Optional[int] = Field(None, ge=0, le=360)

    @model_validator(mode="after")
    def validate_spread_results(self) -> "SpreadResultsMixin":
        fields = [
            self.agent_density,
            self.plant_attack,
            self.max_spread_aspect_deg,
            self.max_spread_distance_m,
        ]

        if self.max_spread_distance_m == None and self.max_spread_aspect_deg != None:
            raise ValueError("Max Spread Distance (M) is a required field")
        elif self.max_spread_aspect_deg == None and self.max_spread_distance_m != None:
            raise ValueError("Max Spread Aspect (deg) is a required field")
        return self
