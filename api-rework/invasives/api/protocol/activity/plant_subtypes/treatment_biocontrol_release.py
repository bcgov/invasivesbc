from typing import List, Literal, Optional
from pydantic import model_validator, field_validator, NaiveDatetime, Field
from api.protocol.activity.validators.no_future_date import no_future_date
from api.protocol.activity.plant_subtypes.base_form_schema import (
    BaseFormSchema,
    CleanSchema,
)

from api.protocol.activity.plant_subtypes.common import (
    MicrositeCondition,
    WeatherConditions,
    BiocontrolCountSimple,
    TargetPlantPhenology,
)
from api.models.enums import YesNoUnknown
from api.protocol.activity.validators.code_validation import (
    BiocontrolAgentCodeType,
    PlantsWithBiocontrolType,
)


class Entry(CleanSchema):
    invasive_plant: PlantsWithBiocontrolType
    biocontrol_agent: BiocontrolAgentCodeType
    linear_segment: YesNoUnknown
    mortality: int = Field(..., ge=0)
    agent_source: str
    collection_date: NaiveDatetime
    plant_collected_from: PlantsWithBiocontrolType = None
    plant_collected_from_manual: Optional[str] = None

    actual_biological_agents: List[BiocontrolCountSimple]
    estimated_biological_agents: List[BiocontrolCountSimple]

    @model_validator(mode="after")
    def set_estimate_flags(self) -> "Entry":
        for count in self.actual_biological_agents:
            count.is_estimate = False
        for count in self.estimated_biological_agents:
            count.is_estimate = True
        return self

    @model_validator(mode="after")
    def validate_min_number_biological_agent_entries(self) -> "Entry":
        if (
            len(self.actual_biological_agents) + len(self.estimated_biological_agents)
            == 0
        ):
            raise ValueError(
                'Record must contain at least one "Actual" or "Estimated" biological agents entry'
            )
        return self

    @field_validator("collection_date")
    def validate_no_future_start_time(cls, v):
        return no_future_date(v)


class SubtypeData(MicrositeCondition, WeatherConditions):
    entries: List[Entry]
    target_plant_phenology: Optional[TargetPlantPhenology] = None


class TreatmentBiocontrolRelease(BaseFormSchema):
    subtype: Literal["Biocontrol_Release"]
    subtype_data: SubtypeData
