from typing import List, Literal, Optional
from pydantic import model_validator, field_validator, NaiveDatetime, Field
from api.protocol.activity.validators.no_future_date import no_future_date
from api.protocol.activity.plant_subtypes.base_form_schema import (
    BaseFormSchema,
    CleanSchema,
    DraftBaseFormSchema,
)

from api.protocol.activity.plant_subtypes.common import (
    MicrositeCondition,
    DraftMicrositeCondition,
    WeatherConditions,
    DraftWeatherConditions,
    BiocontrolCountSimple,
    DraftBiocontrolCountSimple,
    TargetPlantPhenology,
    DraftTargetPlantPhenology,
)
from api.models.enums import YesNoUnknown
from api.protocol.activity.validators.code_validation import (
    BiocontrolAgentCodeType,
    PlantsWithBiocontrolType,
)


class DraftEntry(CleanSchema):
    invasive_plant: Optional[PlantsWithBiocontrolType]
    biocontrol_agent: Optional[BiocontrolAgentCodeType]
    linear_segment: Optional[YesNoUnknown]
    mortality: Optional[int]
    agent_source: Optional[str]
    collection_date: Optional[NaiveDatetime]
    plant_collected_from: Optional[PlantsWithBiocontrolType]
    plant_collected_from_manual: Optional[str]

    actual_biological_agents: List[DraftBiocontrolCountSimple]
    estimated_biological_agents: List[DraftBiocontrolCountSimple]

    @model_validator(mode="after")
    def set_estimate_flags(self) -> "Entry":
        for count in self.actual_biological_agents:
            count.is_estimate = False
        for count in self.estimated_biological_agents:
            count.is_estimate = True
        return self


class Entry(DraftEntry):
    invasive_plant: PlantsWithBiocontrolType
    biocontrol_agent: BiocontrolAgentCodeType
    linear_segment: YesNoUnknown
    mortality: int = Field(..., ge=0)
    agent_source: str
    collection_date: NaiveDatetime
    plant_collected_from: Optional[PlantsWithBiocontrolType] = None
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


class DraftSubtypeData(CleanSchema):
    entries: List[DraftEntry]
    microsite_conditions: DraftMicrositeCondition
    weather_conditions: DraftWeatherConditions
    target_plant_phenology: Optional[DraftTargetPlantPhenology] = None


class SubtypeData(DraftSubtypeData):
    entries: List[Entry]
    microsite_conditions: MicrositeCondition
    weather_conditions: WeatherConditions
    target_plant_phenology: Optional[TargetPlantPhenology] = None


class DraftTreatmentBiocontrolRelease(DraftBaseFormSchema):
    subtype: Literal["Biocontrol_Release"]
    subtype_data: DraftSubtypeData


class TreatmentBiocontrolRelease(BaseFormSchema):
    subtype: Literal["Biocontrol_Release"]
    subtype_data: SubtypeData
