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
from api.models.enums import CollectionType
from api.protocol.activity.validators.code_validation import (
    BiocontrolAgentCodeType,
    PlantsWithBiocontrolType,
    BioAgentCollectionMethodCodeType,
)


class DraftEntry(CleanSchema):
    invasive_plant: Optional[PlantsWithBiocontrolType]
    biological_agent: Optional[BiocontrolAgentCodeType]
    historical_iapp_site: Optional[int] = None
    collection_type: Optional[CollectionType]
    plant_count_collection: Optional[int] = None
    time_collection_duration_minutes: Optional[int] = None
    collection_method: Optional[BioAgentCollectionMethodCodeType]
    number_of_sweeps: Optional[int] = None
    start_time_collecting: Optional[NaiveDatetime]
    end_time_collecting: Optional[NaiveDatetime]
    comment: Optional[str]
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
    biological_agent: BiocontrolAgentCodeType
    historical_iapp_site: Optional[int] = Field(None, ge=0)
    collection_type: CollectionType
    plant_count_collection: Optional[int] = Field(None, gt=0)
    time_collection_duration_minutes: Optional[int] = Field(None, gt=0)
    collection_method: BioAgentCollectionMethodCodeType
    number_of_sweeps: Optional[int] = Field(None, gt=0)
    start_time_collecting: NaiveDatetime
    end_time_collecting: NaiveDatetime

    actual_biological_agents: List[BiocontrolCountSimple]
    estimated_biological_agents: List[BiocontrolCountSimple]

    @model_validator(mode="after")
    def validate_collection_type_followup(self) -> "Entry":
        if self.collection_type == "Timed":
            self.plant_count_collection = None
        elif self.collection_type == "Count":
            self.time_collection_duration_minutes = None
        return self

    @model_validator(mode="after")
    def validate_number_of_sweeps(self) -> "Entry":
        if self.collection_method == "Cs" and self.number_of_sweeps is None:
            raise ValueError(
                '"Number of Sweeps" is required when collection method is "Sweep (counted)"'
            )
        return self

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

    @field_validator("start_time_collecting")
    def validate_start_time_collecting(cls, v):
        return no_future_date(v)

    @field_validator("end_time_collecting")
    def validate_end_time_collecting(cls, v):
        return no_future_date(v)

    @model_validator(mode="after")
    def validate_start_before_end(self) -> "Entry":
        start = self.start_time_collecting
        stop = self.end_time_collecting
        if start and stop and start > stop:
            raise ValueError("Start time cannot occur after stop time.")
        return self


class DraftSubtypeData(CleanSchema):
    entries: List[DraftEntry]
    microsite_conditions: Optional[DraftMicrositeCondition]
    weather_conditions: Optional[DraftWeatherConditions]
    target_plant_phenology: Optional[DraftTargetPlantPhenology] = None


class SubtypeData(DraftSubtypeData):
    entries: List[Entry]
    microsite_conditions: MicrositeCondition
    weather_conditions: WeatherConditions
    target_plant_phenology: Optional[TargetPlantPhenology] = None


class DraftBiocontrolCollection(DraftBaseFormSchema):
    subtype: Literal["Biocontrol_Collection"]
    subtype_data: DraftSubtypeData


class BiocontrolCollection(BaseFormSchema):
    subtype: Literal["Biocontrol_Collection"]
    subtype_data: SubtypeData
