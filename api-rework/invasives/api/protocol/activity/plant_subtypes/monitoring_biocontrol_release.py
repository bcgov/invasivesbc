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
    SpreadResultsMixin,
    DraftSpreadResultsMixin,
    BiocontrolCountExtended,
    DraftBiocontrolCountExtended,
    TargetPlantPhenology,
    DraftTargetPlantPhenology,
)
from api.models.enums import YesNoUnknown, CollectionType
from api.protocol.activity.validators.code_validation import (
    BiocontrolAgentCodeType,
    BioAgentMonitoringMethodCodeType,
    PlantsWithBiocontrolType,
    AgentLocationFoundTerrainCodeType,
    BiocontrolPresenceCodeType,
)


class DraftEntry(CleanSchema):
    biocontrol_agent: Optional[BiocontrolAgentCodeType]
    biocontrol_present: Optional[bool] = False
    invasive_plant: Optional[PlantsWithBiocontrolType]
    monitoring_type: Optional[CollectionType]
    monitoring_method: Optional[BioAgentMonitoringMethodCodeType]
    count_duration_minutes: Optional[int] = None
    plant_count: Optional[int] = None
    location_agent_found: List[AgentLocationFoundTerrainCodeType]
    sign_of_biocontrol_presence: List[BiocontrolPresenceCodeType]
    start_time: Optional[NaiveDatetime]
    stop_time: Optional[NaiveDatetime]
    suitable_for_collection: Optional[YesNoUnknown] = None
    number_of_sweeps: Optional[int] = None
    actual_biological_agents: List[DraftBiocontrolCountExtended]
    estimated_biological_agents: List[DraftBiocontrolCountExtended]

    @model_validator(mode="after")
    def set_estimate_flags(self) -> "Entry":
        for count in self.actual_biological_agents:
            count.is_estimate = False
        for count in self.estimated_biological_agents:
            count.is_estimate = True
        return self


class Entry(DraftEntry):
    biocontrol_agent: BiocontrolAgentCodeType
    biocontrol_present: bool
    invasive_plant: PlantsWithBiocontrolType
    monitoring_type: CollectionType
    monitoring_method: BioAgentMonitoringMethodCodeType
    count_duration_minutes: Optional[int] = None
    plant_count: Optional[int] = None
    location_agent_found: List[AgentLocationFoundTerrainCodeType]
    sign_of_biocontrol_presence: List[BiocontrolPresenceCodeType]
    start_time: NaiveDatetime
    stop_time: NaiveDatetime
    suitable_for_collection: Optional[YesNoUnknown] = None
    number_of_sweeps: Optional[int] = None

    actual_biological_agents: List[BiocontrolCountExtended]
    estimated_biological_agents: List[BiocontrolCountExtended]

    @model_validator(mode="after")
    def set_estimate_flags(self) -> "Entry":
        for count in self.actual_biological_agents:
            count.is_estimate = False
        for count in self.estimated_biological_agents:
            count.is_estimate = True
        return self

    @model_validator(mode="after")
    def collection_type_cleanup(self) -> "Entry":
        if self.monitoring_type == "Timed":
            self.plant_count = None
        elif self.monitoring_type == "Count":
            self.count_duration_minutes = None
        return self

    @model_validator(mode="after")
    def validate_monitoring_method(self) -> "Entry":
        if self.monitoring_method == "Cs" and self.number_of_sweeps is None:
            raise ValueError("Number of sweeps is a required field")
        return self

    @model_validator(mode="after")
    def validate_sequential_date(self):
        start = self.start_time
        stop = self.stop_time
        if start and stop and start > stop:
            raise ValueError("Start time cannot occur after stop time.")
        return self

    @model_validator(mode="after")
    def validate_min_number_biological_agent_entries(self) -> "Entry":
        if (
            self.biocontrol_present
            and len(self.actual_biological_agents)
            + len(self.estimated_biological_agents)
            == 0
        ):
            raise ValueError(
                'Record must contain at least one "Actual" or "Estimated" biological agents entry'
            )
        return self

    @field_validator("start_time")
    @classmethod
    def validate_no_future_start_time(cls, v):
        return no_future_date(v)

    @field_validator("stop_time")
    @classmethod
    def validate_no_future_stop_time(cls, v):
        return no_future_date(v)


class DraftSubtypeData(CleanSchema):
    entries: List[DraftEntry]
    microsite_conditions: DraftMicrositeCondition
    weather_conditions: DraftWeatherConditions
    spread_results: Optional[DraftSpreadResultsMixin] = None
    target_plant_phenology: Optional[DraftTargetPlantPhenology] = None


class SubtypeData(DraftSubtypeData):
    entries: List[Entry] = Field(..., min_length=1)
    microsite_conditions: MicrositeCondition
    weather_conditions: WeatherConditions
    spread_results: Optional[SpreadResultsMixin] = None
    target_plant_phenology: Optional[TargetPlantPhenology] = None


class DraftMonitoringBiocontrolRelease(DraftBaseFormSchema):
    subtype: Literal["Monitoring_Biocontrol_Release_Plant_Terrestrial"]
    subtype_data: DraftSubtypeData


class MonitoringBiocontrolRelease(BaseFormSchema):
    subtype: Literal["Monitoring_Biocontrol_Release_Plant_Terrestrial"]
    subtype_data: SubtypeData
