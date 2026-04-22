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
    BiocontrolCountExtended,
    TargetPlantPhenology,
)
from api.models.enums import CollectionType, YesNoUnknown
from api.protocol.activity.validators.code_validation import (
    BiocontrolAgentCodeType,
    PlantsWithBiocontrolType,
    BioAgentCollectionMethodCodeType,
    AgentLocationFoundCodeType,
    BiocontrolPresenceCodeType,
)


class Entry(CleanSchema):
    biocontrol_agent: BiocontrolAgentCodeType
    biocontrol_present: bool
    invasive_plant: PlantsWithBiocontrolType
    monitoring_type: CollectionType
    plant_count: Optional[int] = Field(None, gt=0)
    linear_segment: Optional[bool] = Field(None)
    monitoring_method: BioAgentCollectionMethodCodeType
    count_duration_minutes: Optional[int] = Field(None, gt=0)
    location_agent_found: List[AgentLocationFoundCodeType] = Field(..., min_length=1)
    number_of_sweeps: Optional[int] = Field(None, gt=0)
    sign_of_biocontrol_presence: List[BiocontrolPresenceCodeType] = Field(
        None, min_length=1
    )
    start_time: NaiveDatetime
    stop_time: NaiveDatetime
    suitable_for_collection: bool

    actual_biological_agents: List[BiocontrolCountExtended]
    estimated_biological_agents: List[BiocontrolCountExtended]

    @model_validator(mode="after")
    def validate_collection_type_followup(self) -> "Entry":
        if self.monitoring_type == "Timed" and self.count_duration_minutes is None:
            raise ValueError(
                '"Count duration (Minutes)" is required when Collection type is "Timed"'
            )
        elif self.monitoring_type == "Count" and self.plant_count is None:
            raise ValueError(
                '"Plant Count" is required when Collection type is "Count"'
            )
        return self

    @model_validator(mode="after")
    def validate_number_of_sweeps(self) -> "Entry":
        if self.monitoring_method == "Cs" and self.number_of_sweeps is None:
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

    @field_validator("start_time")
    def validate_start_time_collecting(cls, v):
        return no_future_date(v)

    @field_validator("stop_time")
    def validate_stop_time_collecting(cls, v):
        return no_future_date(v)

    @model_validator(mode="after")
    def validate_start_before_end(self) -> "Entry":
        start = self.start_time
        stop = self.stop_time
        if start and stop and start > stop:
            raise ValueError("Start time cannot occur after stop time.")
        return self


class SubtypeData(MicrositeCondition, WeatherConditions):
    entries: List[Entry]
    target_plant_phenology: Optional[TargetPlantPhenology] = None


class BiocontrolDispersalMonitoring(BaseFormSchema):
    subtype: Literal["Monitoring_Biocontrol_Dispersal_Plant_Terrestrial"]
    subtype_data: SubtypeData
