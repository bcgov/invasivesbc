from datetime import date, time
from typing import Annotated, Any, Optional

from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    computed_field,
    field_validator,
    model_validator,
)
from pydantic_extra_types.coordinate import Latitude, Longitude


def y_n_to_bool(value: Any) -> bool:
    if value == "Y":
        return True
    if value == "N":
        return False
    raise ValueError("Expected 'Y' or 'N'")


YNFlag = Annotated[bool, BeforeValidator(y_n_to_bool)]


class LegacyIAPPSiteAttributes(BaseModel):
    model_config = ConfigDict(extra="forbid")

    site_id: int
    site_paper_file_id: Optional[str]
    district_lot_number: Optional[str]
    jurisdictions: str
    site_created_date: Optional[date]
    mapsheet: str
    utm_zone: int
    utm_easting: int
    utm_northing: int
    decimal_latitude: Optional[Latitude]
    decimal_longitude: Optional[Longitude]
    biogeoclimatic_zone: str
    sub_zone: str
    variant: Optional[int]
    phase: Optional[str]
    site_series: Optional[str]
    soil_texture: Optional[str]
    site_specific_use: str
    invasive_plant: str
    site_location: Optional[str]
    site_comments: Optional[str]
    entered_by: str
    date_entered: date
    updated_by: str
    date_updated: date
    regional_district: Optional[str]
    regional_invasive_species_organization: Optional[str]
    invasive_plant_management_area: Optional[str]
    protected: bool

    @computed_field
    @property
    def jurisdictions_list(self) -> list[str]:
        return self.jurisdictions.split(", ")


class LegacyIAPPSiteSelection(LegacyIAPPSiteAttributes):
    site_created_date: date

    siteselectionid: int
    survey_paper_file_id: Optional[str]
    last_surveyed_date: date
    primary_surveyor: Optional[str]
    other_surveyors: Optional[str]
    estimated_area_hectares: Optional[float]
    distribution: Optional[str]
    density: Optional[str]
    slope_percent: Optional[int]
    aspect: Optional[int]
    elevation: Optional[int]
    treatment_date: Optional[date]
    treatment_type: Optional[str]
    all_species_on_site: str

    @computed_field
    @property
    def all_species_on_site_list(self) -> list[str]:
        return self.all_species_on_site.split(", ")


class LegacyIAPPSurvey(LegacyIAPPSiteAttributes):
    surveyid: int
    survey_paper_file_id: Optional[str]
    survey_date: date
    survey_type: Optional[str]
    estimated_area_hectares: Optional[float]
    distribution: Optional[str]
    density: Optional[str]
    survey_agency: str
    employer: Optional[str]
    primary_surveyor: Optional[str]
    other_surveyors: Optional[str]
    survey_comments: Optional[str]


class LegacyIAPPChemicalTreatment(LegacyIAPPSiteAttributes):
    site_created_date: date

    chemicaltreatmentid: int
    service_licence_number: Optional[str]
    pmp_number: str
    pup_number: Optional[str]
    treatment_date: Optional[date]
    treatment_paper_file_id: Optional[str]
    treatment_agency: str
    treatment_comments: Optional[str]
    herbicide: str
    method: str
    area_treated_hectares: Optional[float]
    amount_of_mix_used_litres: Optional[float]
    application_rate_litres_per_hectare: Optional[float]
    delivery_rate_litres_per_hectare: Optional[int]
    dilution_percent: Optional[float]
    amount_of_undiluted_herbicide_used_litres: Optional[float]
    tank_mix: Optional[str]
    application_time: Optional[time]
    temperature: Optional[int]
    wind_speed: Optional[int]
    wind_direction: Optional[int]
    humidity: Optional[int]
    employer: Optional[str]
    primary_applicator: str
    other_applicators: str


class LegacyIAPPChemicalMonitoring(LegacyIAPPSiteAttributes):
    site_created_date: date

    chemicalmonitoringid: int
    service_licence_number: Optional[str]
    pmp_number: str
    pup_number: Optional[str]
    herbicide: str
    treatment_method: str
    treatment_date: Optional[date]
    treatment_paper_file_id: Optional[str]
    treatment_comments: Optional[str]
    monitoring_paper_file_id: Optional[str]
    monitoring_agency: str
    inspection_date: date
    primary_surveyor: Optional[str]
    other_surveyors: Optional[str]
    efficacy_rating: str
    estimated_area_hectares: float
    distribution: Optional[str]
    density: Optional[str]
    monitoring_comments: Optional[str]


class LegacyIAPPMechanicalTreatment(LegacyIAPPSiteAttributes):
    site_created_date: date

    mechanicaltreatmentid: int
    treatment_date: Optional[date]
    treatment_paper_file_id: Optional[str]
    treatment_agency: str
    treatment_comments: Optional[str]
    treatment_method: str
    estimated_area_hectares: float
    employer: Optional[str]
    primary_applicator: str
    other_applicators: Optional[str]


class LegacyIAPPMechanicalMonitoring(LegacyIAPPSiteAttributes):
    site_created_date: date

    mechmonitoringid: int
    treatment_method: str
    treatment_date: Optional[date]
    treatment_paper_file_id: Optional[str]
    treatment_comments: Optional[str]
    monitoring_paper_file_id: Optional[str]
    monitoring_agency: str
    inspection_date: date
    primary_surveyor: Optional[str]
    other_surveyors: Optional[str]
    efficacy_rating: str
    estimated_area_hectares: Optional[float]
    distribution: Optional[str]
    density: Optional[str]
    monitoring_comments: Optional[str]


class LegacyIAPPBioDamageFlags(BaseModel):
    model_config = ConfigDict(extra="forbid")

    foliar_feeding_damage: YNFlag
    rootfeeding_damage: YNFlag
    seedfeeding_damage: YNFlag
    oviposition_marks: YNFlag
    eggs_present: YNFlag
    larvae_present: YNFlag
    pupae_present: YNFlag
    adults_present: YNFlag
    tunnels_present: YNFlag


class LegacyIAPPBiologicalTreatment(LegacyIAPPSiteAttributes):
    site_created_date: date

    biotreatmentid: int
    estimated_area_hectares: float
    distribution: Optional[str]
    density: Optional[str]
    treatment_date: Optional[date]
    treatment_paper_file_id: Optional[str]
    treatment_agency: str
    treatment_comments: Optional[str]
    release_quantity: int
    bioagent_source: Optional[str]
    biological_agent: str
    employer: Optional[str]
    collection_date: Optional[date]
    agent_life_stage: Optional[str]
    release_time: Optional[time]
    primary_applicator: str
    other_applicators: Optional[str]
    release_utm_zone: Optional[int]
    release_utm_easting: Optional[int]
    release_utm_northing: Optional[int]


class LegacyIAPPBiologicalMonitoring(
    LegacyIAPPBioDamageFlags, LegacyIAPPSiteAttributes
):
    site_created_date: date

    biologicalmonitoringid: int
    biological_agent: str
    treatment_date: Optional[date]
    treatment_paper_file_id: Optional[str]
    treatment_comments: Optional[str]
    monitoring_paper_file_id: Optional[str]
    monitoring_agency: str
    inspection_date: Optional[date]
    primary_surveyor: Optional[str]
    other_surveyors: Optional[str]
    agent_count: Optional[int]
    plant_count: Optional[int]
    count_duration: Optional[int]
    legacy_presence: YNFlag
    estimated_area_hectares: Optional[float]
    distribution: Optional[str]
    density: Optional[str]
    monitoring_comments: Optional[str]


class LegacyIAPPBiologicalDispersal(LegacyIAPPBioDamageFlags, LegacyIAPPSiteAttributes):
    site_created_date: date

    biologicaldispersalid: int
    biological_agent: str
    dispersal_paper_file_id: Optional[str]
    dispersal_agency: Optional[str]
    inspection_date: Optional[date]
    agent_count: Optional[int]
    plant_count: Optional[int]
    count_duration: Optional[int]
    primary_surveyor: Optional[str]
    other_surveyors: Optional[str]
    dispersal_utm_zone: Optional[int]
    dispersal_utm_easting: Optional[int]
    dispersal_utm_northing: Optional[int]
    estimated_area_hectares: Optional[float]
    distribution: Optional[str]
    density: Optional[str]
    monitoring_comments: Optional[str]


class LegacyIAPPSite(BaseModel):
    model_config = ConfigDict(extra="forbid")

    site_id: int
    protected: bool
    geometries: list[dict]
    site_selections: list[LegacyIAPPSiteSelection] = Field(min_length=1)
    surveys: list[LegacyIAPPSurvey]
    chemical_treatments: list[LegacyIAPPChemicalTreatment]
    chemical_monitorings: list[LegacyIAPPChemicalMonitoring]
    mechanical_treatments: list[LegacyIAPPMechanicalTreatment]
    mechanical_monitorings: list[LegacyIAPPMechanicalMonitoring]
    biological_treatments: list[LegacyIAPPBiologicalTreatment]
    biological_monitorings: list[LegacyIAPPBiologicalMonitoring]
    biological_dispersals: list[LegacyIAPPBiologicalDispersal]

    @field_validator("geometries")
    @classmethod
    def validate_geometry_count(cls, geometries: list[dict]) -> list[dict]:
        if len(geometries) > 1:
            raise ValueError("A site can have at most one geometry")
        return geometries

    @model_validator(mode="after")
    def validate_extract_site_ids(self) -> "LegacyIAPPSite":
        for field_name in (
            "site_selections",
            "surveys",
            "chemical_treatments",
            "chemical_monitorings",
            "mechanical_treatments",
            "mechanical_monitorings",
            "biological_treatments",
            "biological_monitorings",
            "biological_dispersals",
        ):
            for row in getattr(self, field_name):
                row_site_id = (
                    row.get("site_id") if isinstance(row, dict) else row.site_id
                )
                if row_site_id != self.site_id:
                    raise ValueError(
                        f"{field_name} row site_id {row_site_id} does not match "
                        f"parent site_id {self.site_id}"
                    )
        return self

    @computed_field
    @property
    def geometry(self) -> Optional[dict]:
        return self.geometries[0] if self.geometries else None
