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
from api.models.enums import CollectionType
from api.protocol.activity.validators.code_validation import (
    BiocontrolAgentCodeType,
    PlantsWithBiocontrolType,
    BioAgentCollectionMethodCodeType
)


class Entry(CleanSchema):
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
    comment: Optional[str] = None

    actual_biological_agents: List[BiocontrolCountSimple]
    estimated_biological_agents: List[BiocontrolCountSimple]

    @model_validator(mode="after")
    def validate_collection_type_followup(self) -> "Entry":
        if self.collection_type == 'Timed' and self.time_collection_duration_minutes is None:
            raise ValueError('"Count duration (Minutes)" is required when Collection type is "Timed"')
        elif self.collection_type == 'Count' and self.plant_count_collection is None:
            raise ValueError('"Plant Count" is required when Collection type is "Count"')
        return self

    @model_validator(mode="after")
    def validate_number_of_sweeps(self) -> "Entry":
        if self.collection_method == 'Cs' and self.number_of_sweeps is None:
            raise ValueError('"Number of Sweeps" is required when collection method is "Sweep (counted)"')
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
    def validate_start_time_collecting(cls, v):
        return no_future_date(v)

    @model_validator(mode="after")
    def validate_start_before_end(self) -> "Entry":
        start = self.start_time_collecting
        stop = self.end_time_collecting
        if start and stop and start > stop:
            raise ValueError("Start time cannot occur after stop time.")
        return self


class SubtypeData(MicrositeCondition, WeatherConditions):
    entries: List[Entry]
    target_plant_phenology: Optional[TargetPlantPhenology] = None


class BiocontrolCollection(BaseFormSchema):
    subtype: Literal["Biocontrol_Collection"]
    subtype_data: SubtypeData
