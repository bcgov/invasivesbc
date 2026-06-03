from typing import List, Literal, Optional
from pydantic import Field, field_validator, model_validator
from api.protocol.activity.validators.no_repeat_key import no_repeat_key
from api.protocol.activity.plant_subtypes.base_form_schema import (
    BaseFormSchema,
    CleanSchema,
)

from api.models.enums import TreatmentPass, YesNo
from api.protocol.activity.validators.code_validation import (
    TerrestrialPlantCodeType,
    AquaticPlantCodeType,
    EfficacyManagementRatingCodeType,
    InvasivePlantsOnSiteCodeType,
    TreatmentEfficacyRatingCodeType,
)


class InvasivePlantOnSite(CleanSchema):
    invasive_plants_on_site: InvasivePlantsOnSiteCodeType


class Entry(CleanSchema):
    invasive_plant: Optional[TerrestrialPlantCodeType] = None
    invasive_plant_aquatic: Optional[AquaticPlantCodeType] = None
    evidence_of_treatment: YesNo
    treatment_pass: Optional[TreatmentPass] = None
    comment: Optional[str] = None
    invasive_plants_on_site: List[InvasivePlantOnSite] = Field(..., min_length=1)
    management_efficacy_rating: EfficacyManagementRatingCodeType
    treatment_efficacy_rating: Optional[TreatmentEfficacyRatingCodeType] = None

    @model_validator(mode="after")
    def validate_exclusive_plant_type(self) -> "Entry":
        if self.invasive_plant and self.invasive_plant_aquatic:
            raise ValueError("Can't specify both Aquatic and Terrestrial plant types")
        return self

    @model_validator(mode="after")
    def validate_treatment_efficacy_rating(self) -> "Entry":
        if (
            self.evidence_of_treatment == YesNo.Yes
            and self.treatment_efficacy_rating is None
        ):
            raise ValueError(
                "Efficacy Rating is required when evidence of treatment is Yes"
            )
        return self


class SubtypeData(CleanSchema):
    entries: List[Entry] = Field(..., min_length=1)

    @field_validator("entries")
    @classmethod
    def unique_plants(cls, v):
        return no_repeat_key(
            v, key="invasive_plant", key_label="Invasive Plant"
        ) and no_repeat_key(
            v, key="aquatic_invasive_plant", key_label="Aquatic Invasive Plant"
        )


class MonitoringMechanical(BaseFormSchema):
    subtype: Literal["Monitoring_Mechanical_Plant_Terrestrial_Aquatic"]
    subtype_data: SubtypeData
