from typing import List, Literal, Optional, Annotated, Union, Any, Self
from pydantic import (
    model_validator,
    field_validator,
    NaiveDatetime,
    Field,
    Discriminator,
    Tag,
    ConfigDict,
)
from enum import Enum
from api.protocol.activity.validators.check_sum import check_sum
from api.protocol.activity.validators.no_future_date import no_future_date
from api.protocol.activity.plant_subtypes.base_form_schema import (
    BaseFormSchema,
    CleanSchema,
)
from api.models.enums import YesNoUnknown
from api.protocol.activity.validators.code_validation import (
    WindDirectionCodeType,
    ServiceLicenseNumberAndCompanyType,
    PestManagementPlanType,
    ChemicalPrecautionaryStatementType,
    TerrestrialPlantCodeType,
    AquaticPlantCodeType,
    ChemicalApplicationMethodDirectCodeType,
    ChemicalApplicationMethodSprayCodeType,
    LiquidHerbicideCodeType,
    GranularHerbicideCodeType,
)
from .common.chem_calculations import get_chem_calculation_results


class Calculations(Enum):
    APPLICATION_RATE = "Product Application Rate"
    DILUTION = "Dilution"


class WellEntry(CleanSchema):
    well_tag: str
    distance: int


class ChemicalWeatherInformation(CleanSchema):
    humidity: Optional[int] = Field(None, ge=0, le=100)
    temperature_c: int = Field(..., ge=0, lt=100)
    wind_speed_kmh: int = Field(..., ge=0, lt=100)
    wind_direction: WindDirectionCodeType

    @model_validator(mode="after")
    def validate_wind_direction(self) -> "ChemicalWeatherInformation":
        if self.wind_speed_kmh > 0 and self.wind_direction == "No Wind":
            raise ValueError("Must specify a wind direction when wind speed is > 0")
        return self


## Chemical Building Blocks
class BaseHerbicide(CleanSchema):
    type: Literal["granular", "liquid"]
    name: LiquidHerbicideCodeType | GranularHerbicideCodeType


class ApplicationRateHerbicide(BaseHerbicide):
    application_rate: float


class TreatedPlant(CleanSchema):
    invasive_plant: TerrestrialPlantCodeType | AquaticPlantCodeType
    percent_covered: int = Field(..., gt=0, le=100)


## Rate Mix Definitions


class ProductApplicationRate(CleanSchema):
    herbicide: List[ApplicationRateHerbicide] = Field(..., min_length=1)
    delivery_rate: float = Field(..., gt=0)
    amount_mix_used_l: float = Field(..., gt=0)


class ProductDilutionRate(CleanSchema):
    herbicide: List[BaseHerbicide] = Field(..., min_length=1)
    amount_mix_used_l: float = Field(..., gt=0, le=100)
    dilution_percent: float = Field(..., gt=0, le=100)
    area_treated_sqm: float = Field(..., gt=0)


class BaseChemicalTreatmentContext(CleanSchema):
    model_config = ConfigDict(extra="forbid")
    plants_treated: List[TreatedPlant] = Field(..., min_length=1)
    tank_mix: bool
    calculation_type: Literal["Product Application Rate", "Dilution"]
    application_method: (
        ChemicalApplicationMethodDirectCodeType | ChemicalApplicationMethodSprayCodeType
    )
    results: Optional[List[Any]] = Field(
        None, validate_default=False
    )  # Will be filled in by validators

    @field_validator("plants_treated")
    def validate_plants_treated_percent(cls, v):
        return check_sum(v, expected=100, key="percent_covered")


class TankMixChemicalContext(BaseChemicalTreatmentContext, ProductApplicationRate):
    tank_mix: Literal[True] = True


class ChemicalContextDilution(BaseChemicalTreatmentContext, ProductDilutionRate):
    tank_mix: Literal[False] = False


class ChemicalContextApplicationRate(
    BaseChemicalTreatmentContext, ProductApplicationRate
):
    tank_mix: Literal[False]


def resolve_chemical_type(v: Any) -> str | Enum:
    """Helper for Treatment Context Discriminator that handles both dicts and objects"""
    # Normalize input date (Pydantic Object vs Dict)
    if isinstance(v, dict):
        calc_type = v.get("calculation_type")
        tank_mix = v.get("tank_mix")
    else:
        # It's a Pydantic Object
        calc_type = getattr(v, "calculation_type", None)
        tank_mix = getattr(v, "tank_mix", None)

    # Safely extract discriminator value.
    calc_value = calc_type.value if isinstance(calc_type, Enum) else calc_type

    if tank_mix is True and calc_value == Calculations.APPLICATION_RATE.value:
        return "Tank Mix"

    if calc_value == Calculations.DILUTION.value:
        return Calculations.DILUTION
    elif calc_value == Calculations.APPLICATION_RATE.value:
        return Calculations.APPLICATION_RATE

    raise ValueError("Chemical treatment values created an invalid scenario.")


class Context(ChemicalWeatherInformation):
    service_license_number: Optional[ServiceLicenseNumberAndCompanyType] = None
    pesticide_use_permit: Optional[str] = None
    pest_management_plan: Optional[PestManagementPlanType] = None
    pest_management_plan_manual: Optional[str] = None
    treatment_notice_signs: YesNoUnknown
    precautionary_statement: ChemicalPrecautionaryStatementType
    application_start_time: NaiveDatetime
    ntz_reduction_bool: bool
    rationale_for_ntz_reduction: Optional[str] = None
    additional_unmapped_well_water_bool: bool
    pest_injury_threshold_determination_bool: bool

    @field_validator("application_start_time")
    def validate_start_time(cls, v):
        return no_future_date(v)

    @model_validator(mode="after")
    def validate_ntz_reduction_rationale(self):
        if self.ntz_reduction_bool and not self.rationale_for_ntz_reduction:
            raise ValueError(
                "Rationale for NTZ Reduction is required when NTZ Reduction is positive"
            )
        return self

    @model_validator(mode="after")
    def validate_pest_management_plan(self) -> Self:
        if self.pest_management_plan and self.pest_management_plan_manual:
            raise ValueError(
                "You must only fill either Pest Management Plan or Unlisted Drop Down field."
            )
        elif not self.pest_management_plan and not self.pest_management_plan_manual:
            raise ValueError(
                'Either "Pest Management Plan" or "PMP # not in dropdown" has to be filled.'
            )
        return self


class BaseChemicalDetails(CleanSchema):
    context: Context
    treatment_context: Annotated[
        Union[
            Annotated[TankMixChemicalContext, Tag("Tank Mix")],
            Annotated[ChemicalContextDilution, Tag(Calculations.DILUTION)],
            Annotated[
                ChemicalContextApplicationRate, Tag(Calculations.APPLICATION_RATE)
            ],
        ],
        Discriminator(resolve_chemical_type),
    ]


class TreatmentChemicalAquatic(BaseFormSchema):
    subtype: Literal["Treatment_Chemical_Plant_Aquatic"]
    subtype_data: BaseChemicalDetails

    @model_validator(mode="after")
    def get_chemical_treatment_calculations(self) -> Self:
        """Apply Chemical Validations through the backend"""
        self.subtype_data.treatment_context.results = get_chem_calculation_results(
            treatment_context=self.subtype_data.treatment_context, area_m=self.area_m
        )
        return self


class TreatmentChemicalTerrestrial(TreatmentChemicalAquatic):
    subtype: Literal["Treatment_Chemical_Plant_Terrestrial"]
