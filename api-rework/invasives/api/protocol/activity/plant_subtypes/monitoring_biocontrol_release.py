from typing import List, Literal, Optional
from pydantic import model_validator
from datetime import datetime
from api.protocol.activity.plant_subtypes.base_form_schema import (
    CleanSchema,
)

from api.protocol.activity.plant_subtypes.common import (
    MicrositeCondition,
    WeatherConditions,
    SpreadResultsMixin,
    BiocontrolCountExtended,
    TargetPlantPhenology,
)
from api.models.enums import YesNoUnknown, CollectionType
from api.protocol.activity.validators.code_validation import (
    BiocontrolAgentCodeType,
    BioAgentCollectionMethodCodeType,
    TerrestrialPlantCodeType,
    AgentLocationFoundCodeType,
    BiocontrolPresenceCodeType,
)


class Entry(CleanSchema):
    biocontrol_agent: BiocontrolAgentCodeType
    biocontrol_present: bool
    invasive_plant: TerrestrialPlantCodeType
    monitoring_type: CollectionType
    monitoring_method: BioAgentCollectionMethodCodeType
    count_duration_minutes: Optional[int] = None
    plant_count: Optional[int] = None
    location_agent_found: List[AgentLocationFoundCodeType]
    sign_of_biocontrol_presence: List[BiocontrolPresenceCodeType]
    start_time: datetime
    stop_time: datetime
    suitable_for_collection: YesNoUnknown
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
    def validate_monitoring_type(self) -> "Entry":
        if self.monitoring_type == "Timed" and self.count_duration_minutes is None:
            raise ValueError("Count duration minutes is a required field")
        elif self.monitoring_type == "Count" and self.plant_count is None:
            print("We in it")
            raise ValueError("Plant Count is a required field")
        return self

    @model_validator(mode="after")
    def validate_monitoring_method(self) -> "Entry":
        if self.monitoring_method == "Cs" and self.number_of_sweeps is None:
            raise ValueError("Number of sweeps is a required field")
        return self

    @model_validator(mode="after")
    def validate_biocontrol_present(self) -> "Entry":
        if self.biocontrol_present and (
            self.sign_of_biocontrol_presence is None
            or len(self.sign_of_biocontrol_presence) == 0
        ):
            raise ValueError("Sign of Biocontrol Presence is a required field")
        return self

    @model_validator(mode="after")
    def validate_sequential_date(self):
        if self.start_time >= self.stop_time:
            raise ValueError("Start time cannot occur after stop time.")


class SubtypeData(MicrositeCondition, WeatherConditions, SpreadResultsMixin):
    entries: List[Entry]
    target_plant_phenology: Optional[TargetPlantPhenology] = None


class MonitoringBiocontrolRelease(CleanSchema):
    subtype: Literal["Monitoring_Biocontrol_Release_Plant_Terrestrial"]
    subtype_data: SubtypeData
