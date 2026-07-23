from typing import List, Literal, Optional, Annotated, Union, Any, Self
from enum import Enum
from pydantic import (
    model_validator,
    field_validator,
    NaiveDatetime,
    Field,
    Discriminator,
    Tag,
    ConfigDict,
)
from .common.chem_calculations import get_chem_calculation_results
from api.models.enums import YesNoUnknown
from api.protocol.activity.validators.check_sum import check_sum
from api.protocol.activity.validators.no_future_date import no_future_date
from api.protocol.activity.plant_subtypes.base_form_schema import (
    BaseFormSchema,
    CleanSchema,
    DraftBaseFormSchema,
)
from api.protocol.activity.validators.code_validation import (
    WindDirectionCodeType,
    ServiceLicenseNumberAndCompanyType,
    PestManagementPlanType,
    ChemicalPrecautionaryStatementType,
    AquaticPlantCodeType,
    LiquidHerbicideCodeType,
    GranularHerbicideCodeType,
    HerbicideApplicationMethodCodeType,
    HerbicideTypeCodeType,
)


class Calculations(Enum):
    APPLICATION_RATE = "PAR"
    DILUTION = "D"
    DRAFT = "Draft"


class WellEntry(CleanSchema):
    well_tag: str
    distance: int


class DraftChemicalWeatherInformation(CleanSchema):
    humidity: Optional[int] = None
    temperature_c: Optional[int] = None
    wind_speed_kmh: Optional[int] = None
    wind_direction: Optional[WindDirectionCodeType]


class ChemicalWeatherInformation(DraftChemicalWeatherInformation):
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


class DraftBaseHerbicide(CleanSchema):
    type: Optional[HerbicideTypeCodeType] = None
    name: Optional[LiquidHerbicideCodeType | GranularHerbicideCodeType] = None


class BaseHerbicide(DraftBaseHerbicide):
    type: HerbicideTypeCodeType
    name: LiquidHerbicideCodeType | GranularHerbicideCodeType


class DraftApplicationRateHerbicide(DraftBaseHerbicide):
    application_rate: Optional[float]


class ApplicationRateHerbicide(BaseHerbicide):
    application_rate: float


class DraftTreatedPlant(CleanSchema):
    invasive_plant: Optional[AquaticPlantCodeType]
    percent_covered: Optional[int]


class TreatedPlant(DraftTreatedPlant):
    invasive_plant: AquaticPlantCodeType
    percent_covered: int = Field(..., gt=0, le=100)


## Rate Mix Definitions


class DraftProductApplicationRate(CleanSchema):
    herbicide: List[DraftApplicationRateHerbicide]
    delivery_rate: Optional[float] = None
    amount_mix_used_l: Optional[float] = None


class ProductApplicationRate(CleanSchema):
    herbicide: List[ApplicationRateHerbicide] = Field(..., min_length=1)
    delivery_rate: float = Field(..., gt=0)
    amount_mix_used_l: float = Field(..., gt=0)


class DraftProductDilutionRate(CleanSchema):
    herbicide: List[BaseHerbicide]
    amount_mix_used_l: Optional[float] = None
    dilution_percent: Optional[float] = None
    area_treated_sqm: Optional[float] = None


class ProductDilutionRate(DraftProductDilutionRate):
    herbicide: List[BaseHerbicide] = Field(..., min_length=1)
    amount_mix_used_l: float = Field(..., gt=0, le=100)
    dilution_percent: float = Field(..., gt=0, le=100)
    area_treated_sqm: float = Field(..., gt=0)


class DraftBaseChemicalTreatmentContext(CleanSchema):
    plants_treated: List[DraftTreatedPlant]
    tank_mix: bool
    calculation_type: Optional[Literal["PAR", "D"]] = None
    application_method: Optional[HerbicideApplicationMethodCodeType] = None
    results: Optional[List[Any]] = None
    herbicide: Optional[List[DraftBaseHerbicide]] = None


class BaseChemicalTreatmentContext(CleanSchema):
    model_config = ConfigDict()
    plants_treated: List[TreatedPlant] = Field(..., min_length=1)
    tank_mix: bool
    calculation_type: Literal["PAR", "D"]
    application_method: HerbicideApplicationMethodCodeType
    results: Optional[List[Any]] = Field(
        None, validate_default=False
    )  # Will be filled in by validators

    @field_validator("plants_treated")
    def validate_plants_treated_percent(cls, v):
        return check_sum(v, expected=100, key="percent_covered")


class DraftTankMixChemicalContext(
    DraftBaseChemicalTreatmentContext, DraftProductApplicationRate
):
    tank_mix: Literal[True] = True


class TankMixChemicalContext(BaseChemicalTreatmentContext, ProductApplicationRate):
    tank_mix: Literal[True] = True


class DraftChemicalContextDilution(
    DraftBaseChemicalTreatmentContext, DraftProductDilutionRate
):
    tank_mix: Literal[False] = False


class ChemicalContextDilution(BaseChemicalTreatmentContext, ProductDilutionRate):
    tank_mix: Literal[False] = False


class DraftChemicalContextApplicationRate(
    DraftBaseChemicalTreatmentContext, DraftProductApplicationRate
):
    tank_mix: Literal[False] = False


class ChemicalContextApplicationRate(
    BaseChemicalTreatmentContext, ProductApplicationRate
):
    tank_mix: Literal[False] = False


def base_resolve_chemical_type(v: Any) -> str | Enum:
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

    return None


def resolve_draft_chemical_type(v: Any):
    val = base_resolve_chemical_type(v)
    if not val:
        return Calculations.DRAFT
    return val


def resolve_chemical_type(v: Any) -> str | Enum:
    val = base_resolve_chemical_type(v)
    if not val:
        raise ValueError("Chemical treatment values created an invalid scenario.")
    return val


class DraftContext(DraftChemicalWeatherInformation):
    pesticide_employer_code: Optional[ServiceLicenseNumberAndCompanyType]
    pesticide_use_permit: Optional[str]
    pest_management_plan: Optional[PestManagementPlanType]
    pest_management_plan_manual: Optional[str]
    treatment_notice_signs: Optional[YesNoUnknown]
    precautionary_statement: Optional[ChemicalPrecautionaryStatementType]
    application_start_time: Optional[NaiveDatetime]
    ntz_reduction: Optional[bool]
    rationale_for_ntz_reduction: Optional[str]
    additional_unmapped_well_water: Optional[bool]
    pest_injury_threshold_determination: Optional[bool]


class Context(ChemicalWeatherInformation):
    pesticide_employer_code: Optional[ServiceLicenseNumberAndCompanyType] = None
    pesticide_use_permit: Optional[str] = None
    pest_management_plan: Optional[PestManagementPlanType] = None
    pest_management_plan_manual: Optional[str] = None
    treatment_notice_signs: YesNoUnknown
    precautionary_statement: ChemicalPrecautionaryStatementType
    application_start_time: NaiveDatetime
    ntz_reduction: bool
    rationale_for_ntz_reduction: Optional[str] = None
    additional_unmapped_well_water: bool
    pest_injury_threshold_determination: bool

    @field_validator("application_start_time")
    def validate_start_time(cls, v):
        return no_future_date(v)

    @model_validator(mode="after")
    def validate_ntz_reduction_rationale(self):
        if self.ntz_reduction and not self.rationale_for_ntz_reduction:
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


class DraftBaseChemicalDetails(CleanSchema):
    context: DraftContext
    well_entries: List[WellEntry]
    treatment_context: Annotated[
        Union[
            Annotated[DraftTankMixChemicalContext, Tag("Tank Mix")],
            Annotated[DraftChemicalContextDilution, Tag(Calculations.DILUTION)],
            Annotated[
                DraftChemicalContextApplicationRate, Tag(Calculations.APPLICATION_RATE)
            ],
            Annotated[DraftBaseChemicalTreatmentContext, Tag(Calculations.DRAFT)],
        ],
        Discriminator(resolve_draft_chemical_type),
    ]


class BaseChemicalDetails(DraftBaseChemicalDetails):
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


#####
# Aquatic Treatment Types (Draft/Submit)
class DraftTreatmentChemicalAquatic(DraftBaseFormSchema):
    subtype: Literal["Treatment_Chemical_Plant_Aquatic"]
    subtype_data: DraftBaseChemicalDetails


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
