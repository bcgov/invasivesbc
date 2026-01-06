from datetime import date
from enum import Enum
from typing import Literal, Optional

from pydantic import AwareDatetime, BaseModel, Field, JsonValue, UUID4, model_validator
from pydantic_extra_types.coordinate import Latitude, Longitude


class ActivityType(Enum):
    Biocontrol = "Biocontrol"
    Monitoring = "Monitoring"
    Observation = "Observation"
    Shift = "Shift"
    Treatment = "Treatment"


class ActivitySubtype(Enum):
    Activity_Biocontrol_Collection = "Activity_Biocontrol_Collection"
    Activity_Biocontrol_Release = "Activity_Biocontrol_Release"
    Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant = (
        "Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant"
    )
    Activity_Monitoring_BiocontrolRelease_TerrestrialPlant = (
        "Activity_Monitoring_BiocontrolRelease_TerrestrialPlant"
    )
    Activity_Monitoring_ChemicalTerrestrialAquaticPlant = (
        "Activity_Monitoring_ChemicalTerrestrialAquaticPlant"
    )
    Activity_Monitoring_MechanicalTerrestrialAquaticPlant = (
        "Activity_Monitoring_MechanicalTerrestrialAquaticPlant"
    )
    Activity_Observation_Mussels = "Activity_Observation_Mussels"
    Activity_Observation_PlantAquatic = "Activity_Observation_PlantAquatic"
    Activity_Observation_PlantTerrestrial = "Activity_Observation_PlantTerrestrial"
    Activity_Officer_Shift = "Activity_Officer_Shift"
    Activity_Treatment_ChemicalPlantAquatic = "Activity_Treatment_ChemicalPlantAquatic"
    Activity_Treatment_ChemicalPlantTerrestrial = (
        "Activity_Treatment_ChemicalPlantTerrestrial"
    )
    Activity_Treatment_MechanicalPlantAquatic = (
        "Activity_Treatment_MechanicalPlantAquatic"
    )
    Activity_Treatment_MechanicalPlantTerrestrial = (
        "Activity_Treatment_MechanicalPlantTerrestrial"
    )
    Treatment_Mechanical_Aquatic_Plant = "Treatment - Mechanical - Aquatic Plant"


class LegacyProjectCode(BaseModel):
    description: Optional[str] = Field(default=None)


class LegacyActivityJurisdiction(BaseModel):
    jurisdiction_code: str
    percent_covered: int


class LegacyActivityData(BaseModel):
    # linked_id: Optional[str] = Field(default=None) # this can appear one level up in the JSON too!?
    latitude: Latitude
    longitude: Longitude
    project_code: Optional[list[LegacyProjectCode]] = Field(default=None)
    jurisdictions: list[LegacyActivityJurisdiction]
    utm_zone: str | int
    utm_easting: float
    utm_northing: float
    reported_area: float
    general_comment: Optional[str] = Field(default=None)
    access_description: Optional[str] = Field(default=None)
    location_description: Optional[str] = Field(default=None)
    activity_date_time: AwareDatetime
    invasive_species_agency_code: str
    employer_code: str


class LegacyActivityPersons(BaseModel):
    person_name: str
    applicator_license: Optional[int] = Field(default=None)


class LegacyActivityTypeData(BaseModel):

    @model_validator(mode="before")
    def sanitize(cls, values: dict) -> dict:
        if values.get("copy_geometry") == "":
            values["copy_geometry"] = None
        return values

    linked_id: Optional[str] = Field(
        default=None
    )  # this can appear in other places too. which is the authority?
    legacy_iapp_id: Optional[str | int] = Field(
        default=None
    )  # Is this related to historical_iapp_site_id?
    copy_geometry: Optional[Literal["Yes", "No"]] = Field(
        default=None
    )  # this can appear in other places too. which is the authority?
    activity_persons: Optional[list[LegacyActivityPersons]] = Field(default=None)
    pre_treatment_observation: Optional[Literal["Yes", "No", "Unknown"]] = Field(
        default=None
    )


class LegacyUTMCoords(BaseModel):
    utm_easting: Optional[float] = Field(default=None)
    utm_northing: Optional[float] = Field(default=None)
    utm_zone: Optional[str | int] = Field(default=None)


class LegacyActivityVoucherVerificationInformation(BaseModel):
    organization: Optional[str] = Field(default=None)
    person_name: Optional[str] = Field(default=None)


class LegacyActivityVoucherSpecimenInformation(BaseModel):
    exact_utm_coords: Optional[LegacyUTMCoords] = Field(default=None)
    date_voucher_verified: Optional[date] = Field(default=None)
    date_voucher_collected: Optional[date] = Field(default=None)
    name_of_herbarium: Optional[str] = Field(default=None)
    voucher_sample_id: Optional[str] = Field(default=None)
    voucher_verification_completed_by: Optional[
        LegacyActivityVoucherVerificationInformation
    ] = Field(default=None)


class LegacyActivityTerrestrialPlants(BaseModel):
    @model_validator(mode="before")
    def strip_empty(cls, values: dict) -> dict:
        # there's one record like this. misplaced?
        if isinstance(values, dict):
            if "occurrence" in values:
                values.pop("occurrence")
        return values

    observation_type: Literal["Positive Observation", "Negative Observation"]
    invasive_plant_code: Optional[str] = Field(default=None)
    voucher_specimen_collected: Optional[Literal["Yes", "No"]] = Field(default=None)
    plant_life_stage_code: Optional[str] = Field(default=None)
    invasive_plant_density_code: Optional[str] = Field(default=None)
    invasive_plant_distribution_code: Optional[str] = Field(default=None)
    voucher_specimen_collection_information: Optional[
        LegacyActivityVoucherSpecimenInformation
    ] = Field(default=None)


class LegacyActivityAquaticPlants(BaseModel):
    sample_point_id: Optional[str] = Field(default=None)
    observation_type: Literal["Positive Observation", "Negative Observation"]
    invasive_plant_code: Optional[str] = Field(default=None)
    plant_life_stage_code: Optional[str] = Field(default=None)
    voucher_specimen_collected: Optional[Literal["Yes", "No"]] = Field(default=None)
    invasive_plant_density_code: Optional[str] = Field(default=None)
    invasive_plant_distribution_code: Optional[str] = Field(default=None)
    voucher_specimen_collection_information: Optional[
        LegacyActivityVoucherSpecimenInformation
    ] = Field(default=None)


class LegacyActivityTerrestrialPlantObservation(BaseModel):

    well_ind: Optional[str] = Field(default=None)
    slope_code: Optional[str] = Field(default=None)
    aspect_code: Optional[str] = Field(default=None)
    specific_use_code: Optional[str] = Field(default=None)
    research_detection_ind: Optional[str] = Field(default=None)
    suitable_for_biocontrol_agent: Optional[Literal["Yes", "No", "Unknown"]] = Field(
        default=None
    )
    soil_texture_code: Optional[str] = Field(default=None)


class LegacyActivityAquaticPlantObservation(BaseModel):
    suitable_for_biocontrol_agent: Literal["YES", "NO", "Yes", "No", "Unknown"]


class LegacyActivityShorelineTypes(BaseModel):
    shoreline_type: Optional[str] = Field(default=None)
    percent_covered: Optional[float] = Field(default=None)
    substrate_type: Optional[str] = Field(default=None)
    tidal_influence: Optional[Literal["Yes", "No", "Unknown"]] = Field(default=None)
    waterbody_name_local: Optional[str] = Field(default=None)


class LegacyActivityWaterbodyData(BaseModel):
    waterbody_type: str
    outflow: Optional[str] = Field(default=None)
    inflow_other: Optional[str] = Field(default=None)
    outflow_other: Optional[str] = Field(default=None)
    waterbody_use: Optional[str] = Field(default=None)
    substrate_type: Optional[str] = Field(default=None)
    tidal_influence: Optional[Literal["Yes", "No", "Unknown"]] = Field(default=None)
    inflow_permanent: Optional[str] = Field(default=None)
    waterbody_access: Optional[str] = Field(default=None)
    adjacent_land_use: Optional[str] = Field(default=None)
    waterbody_name_local: Optional[str] = Field(default=None)
    water_level_management: Optional[str] = Field(default=None)
    waterbody_name_gazetted: Optional[str] = Field(default=None)
    water_colour: Optional[str] = Field(default=None)
    comment: Optional[str] = Field(default=None)


class LegacyActivityWaterQuality(BaseModel):
    secchi_depth: Optional[float] = Field(default=None)
    water_sample_depth: Optional[float] = Field(default=None)
    water_colour: Optional[str] = Field(default=None)


class LegacyActivityMechanicalDisposedMaterial(BaseModel):
    disposed_material_input_format: Optional[str] = Field(default=None)
    disposed_material_input_number: Optional[float] = Field(default=None)


class LegacyActivityMechanicalPlantTreatmentInformation(BaseModel):
    treated_area: Optional[float] = Field(default=None)
    invasive_plant_code: Optional[str] = Field(default=None)
    mechanical_method_code: Optional[str] = Field(default=None)
    mechanical_disposal_code: Optional[str] = Field(default=None)
    disposed_material: Optional[LegacyActivityMechanicalDisposedMaterial] = Field(
        default=None
    )


class LegacyActivityChemicalPlantTreatmentInformation(BaseModel):
    wind_speed: float
    temperature: float
    ntz_reduction: bool
    unmapped_wells: bool
    humidity: Optional[float] = Field(default=None)
    signage_on_site: Literal["Yes", "No", "Unknown"]
    pmp_not_in_dropdown: Optional[str] = Field(default=None)
    pest_management_plan: Optional[str] = Field(default=None)
    wind_direction_code: str
    application_start_time: Optional[AwareDatetime] = Field(default=None)
    pesticide_employer_code: str
    pesticide_use_permit_PUP: Optional[str] = Field(default=None)
    precautionary_statement: Optional[str] = Field(default=None)
    rationale_for_ntz_reduction: Optional[str] = Field(default=None)


class LegacyActivityPestInjuryThresholdDetermination(BaseModel):
    completed_radio: bool


class LegacyChemicalTreatmentDetails(BaseModel):
    errors: Optional[bool] = Field(default=None)
    tank_mix: Optional[bool] = Field(default=None)
    skipAppRateValidation: Optional[bool] = Field(default=None)
    chemical_application_method: Optional[str] = Field(default=None)
    chemical_application_method_type: Optional[str] = Field(default=None)
    calculation_results: Optional[JsonValue] = Field(default=None)
    tank_mix_object: Optional[JsonValue] = Field(default=None)
    herbicides: Optional[JsonValue] = Field(default=None)
    invasive_plants: Optional[JsonValue] = Field(default=None)


class LegacyActivityChemicalMonitoring(BaseModel):
    efficacy_code: Optional[str] = Field(default=None)
    management_efficacy_rating: Optional[str] = Field(default=None)
    treatment_pass: Optional[str] = Field(default=None)
    invasive_plants_on_site: Optional[str] = Field(default=None)
    invasive_plant_code: Optional[str] = Field(default=None)
    invasive_plant_aquatic_code: Optional[str] = Field(default=None)
    comment: Optional[str] = Field(default=None)
    evidence_of_treatment: Literal["Yes", "No"]


class LegacyActivityMedia(BaseModel):
    editing: Optional[bool] = Field(default=None)
    description: str
    file_name: str
    media_key: Optional[str] = Field(default=None)  # deprecated?
    media_date: Optional[date] = Field(default=None)  # deprecated?


class LegacyWellInformation(BaseModel):
    well_id: str
    well_proximity: Optional[float | Literal["No wells found"]] = Field(default=None)


class LegacyWeatherConditions(BaseModel):
    wind_speed: float
    temperature: float
    wind_aspect: Optional[str | int] = Field(default=None)
    wind_direction_code: Optional[str] = Field(default=None)
    cloud_cover_code: Optional[str] = Field(default=None)
    precipitation_code: Optional[str] = Field(default=None)
    weather_comments: Optional[str] = Field(default=None)


class LegacyMicrositeConditions(BaseModel):
    mesoslope_position_code: Optional[str] = Field(default=None)
    site_surface_shape_code: Optional[str] = Field(default=None)


class LegacyTargetPlantPhenology(BaseModel):
    @model_validator(mode="before")
    def strip_empty(cls, values: dict) -> dict:
        if isinstance(values, dict):
            if isinstance(values.get("target_plant_heights"), list):
                values["target_plant_heights"] = [
                    v for v in values["target_plant_heights"] if v != {}
                ]
        return values

    bolts: Optional[int] = Field(default=None)
    rosettes: Optional[int] = Field(default=None)
    flowering: Optional[int] = Field(default=None)
    seedlings: Optional[int] = Field(default=None)
    senescent: Optional[int] = Field(default=None)
    seeds_forming: Optional[int] = Field(default=None)
    winter_dormant: Optional[int] = Field(default=None)
    target_plant_heights: Optional[list[float]] = Field(default=None)
    phenology_details_recorded: Literal["Yes", "No"]


class LegacyBiologicalAgentInformation(BaseModel):
    release_quantity: Optional[int] = Field(default=None)
    biological_agent_stage_code: Optional[str] = Field(default=None)


class LegacyBiologicalAgentMonitoringInformation(BaseModel):
    release_quantity: Optional[int] = Field(default=None)
    biological_agent_stage_code: Optional[str] = Field(default=None)
    plant_position: Optional[str] = Field(default=None)
    agent_location: Optional[str] = Field(default=None)


class LegacyBiocontrolCollectionInformation(BaseModel):
    start_time: Optional[AwareDatetime] = Field(default=None)
    stop_time: Optional[AwareDatetime] = Field(default=None)
    comment: Optional[str] = Field(default=None)
    plant_count: Optional[int] = Field(default=None)
    collection_type: Optional[str] = Field(default=None)
    collection_method: Optional[str] = Field(default=None)
    invasive_plant_code: Optional[str] = Field(default=None)
    biological_agent_code: Optional[str] = Field(default=None)
    historical_iapp_site_id: Optional[int | str] = Field(
        default=None
    )  # Is this related to legacy_iapp_id?
    total_bio_agent_quantity_actual: Optional[int] = Field(default=None)
    total_bio_agent_quantity_estimated: Optional[int] = Field(default=None)
    actual_biological_agents: Optional[list[LegacyBiologicalAgentInformation]] = Field(
        default=None
    )
    estimated_biological_agents: Optional[list[LegacyBiologicalAgentInformation]] = (
        Field(default=None)
    )
    num_of_sweeps: Optional[int] = Field(default=None)


class LegacyBiocontrolDispersionMonitoring(BaseModel):
    start_time: Optional[AwareDatetime] = Field(default=None)
    stop_time: Optional[AwareDatetime] = Field(default=None)
    monitoring_type: Optional[str] = Field(default=None)
    linear_segment: Optional[Literal["Yes", "No", "Unknown"]] = Field(default=None)
    biocontrol_present: Optional[bool] = Field(default=None)
    invasive_plant_code: Optional[str] = Field(default=None)
    biological_agent_code: Optional[str] = Field(default=None)
    bio_agent_location_code: Optional[str] = Field(default=None)
    suitable_collection_site: Optional[Literal["Yes", "No", "Unknown"]] = Field(
        default=None
    )
    biological_agent_presence_code: Optional[str] = Field(default=None)
    total_bio_agent_quantity_actual: Optional[int] = Field(default=None)
    total_bio_agent_quantity_estimated: Optional[int] = Field(default=None)
    biocontrol_monitoring_methods_code: Optional[str] = Field(default=None)
    estimated_biological_agents: Optional[
        list[LegacyBiologicalAgentMonitoringInformation]
    ] = Field(default=None)
    actual_biological_agents: Optional[
        list[LegacyBiologicalAgentMonitoringInformation]
    ] = Field(default=None)
    num_of_sweeps: Optional[int] = Field(default=None)
    plant_count: Optional[int] = Field(default=None)


class LegacyBiocontrolReleaseInformation(BaseModel):
    mortality: Optional[int] = Field(default=None)
    agent_source: Optional[str] = Field(default=None)
    invasive_plant_code: Optional[str] = Field(default=None)
    plant_collected_from: Optional[str] = Field(default=None)
    linear_segment: Optional[Literal["Yes", "No", "Unknown"]] = Field(default=None)
    biological_agent_code: Optional[str] = Field(default=None)
    plant_collected_from_unlisted: Optional[str] = Field(default=None)
    total_bio_agent_quantity_actual: Optional[int] = Field(default=None)
    total_bio_agent_quantity_estimated: Optional[int] = Field(default=None)
    collection_date: Optional[AwareDatetime] = Field(default=None)
    actual_biological_agents: Optional[
        list[LegacyBiologicalAgentMonitoringInformation]
    ] = Field(default=None)
    estimated_biological_agents: Optional[
        list[LegacyBiologicalAgentMonitoringInformation]
    ] = Field(default=None)


class LegacySpreadResults(BaseModel):
    spread_details_recorded: Optional[Literal["Yes", "No"]] = Field(default=None)
    max_spread_aspect: Optional[int] = Field(default=None)
    max_spread_distance: Optional[int] = Field(default=None)
    agent_density: Optional[int] = Field(default=None)
    plant_attack: Optional[int] = Field(default=None)


class LegacyBiocontrolReleaseTerrestrialPlantInformation(BaseModel):
    start_time: Optional[AwareDatetime] = Field(default=None)
    stop_time: Optional[AwareDatetime] = Field(default=None)
    actual_biological_agents: Optional[
        list[LegacyBiologicalAgentMonitoringInformation]
    ] = Field(default=None)
    estimated_biological_agents: Optional[
        list[LegacyBiologicalAgentMonitoringInformation]
    ] = Field(default=None)
    plant_count: Optional[int] = Field(default=None)
    invasive_plant_code: Optional[str] = Field(default=None)
    biological_agent_code: Optional[str] = Field(default=None)
    bio_agent_location_code: Optional[str] = Field(default=None)
    suitable_collection_site: Optional[Literal["Yes", "No", "Unknown"]] = Field(
        default=None
    )
    biological_agent_presence_code: Optional[str] = Field(default=None)
    total_bio_agent_quantity_actual: Optional[int] = Field(default=None)
    total_bio_agent_quantity_estimated: Optional[int] = Field(default=None)
    biocontrol_monitoring_methods_code: Optional[str] = Field(default=None)
    monitoring_type: Optional[str] = Field(default=None)
    biocontrol_present: Optional[bool] = Field(default=None)
    num_of_sweeps: Optional[int] = Field(default=None)


class LegacyMechanicalTerrestrialAquaticMonitoringInformation(BaseModel):
    comment: Optional[str] = Field(default=None)
    efficacy_code: Optional[str] = Field(default=None)
    treatment_pass: Optional[str] = Field(default=None)
    invasive_plant_code: Optional[str] = Field(default=None)
    invasive_plant_aquatic_code: Optional[str] = Field(default=None)
    evidence_of_treatment: Optional[str] = Field(default=None)
    invasive_plants_on_site: Optional[str] = Field(default=None)
    management_efficacy_rating: Optional[str] = Field(default=None)


class LegacyActivitySubtypeData(BaseModel):

    @model_validator(mode="before")
    def strip_empty(cls, values: dict) -> dict:
        if isinstance(values, dict):
            if isinstance(values.get("TerrestrialPlants"), list):
                values["TerrestrialPlants"] = [
                    v for v in values["TerrestrialPlants"] if v != {}
                ]

            # an element of the list is a list
            if isinstance(values.get("Well_Information"), list):
                flatten = lambda x: (
                    x[0] if isinstance(x, list) and x[0] is not None else x
                )
                values["Well_Information"] = [
                    flatten(v) for v in values["Well_Information"]
                ]

            # it isn't a list but should be
            if isinstance(
                values.get("Monitoring_BiocontrolRelease_TerrestrialPlant_Information"),
                dict,
            ):
                values["Monitoring_BiocontrolRelease_TerrestrialPlant_Information"] = [
                    values["Monitoring_BiocontrolRelease_TerrestrialPlant_Information"]
                ]

        return values

    TerrestrialPlants: Optional[list[LegacyActivityTerrestrialPlants]] = Field(
        default=None
    )
    Observation_PlantTerrestrial_Information: Optional[
        LegacyActivityTerrestrialPlantObservation
    ] = Field(default=None)
    ShorelineTypes: Optional[list[LegacyActivityShorelineTypes]] = Field(default=None)
    WaterbodyData: Optional[LegacyActivityWaterbodyData] = Field(default=None)
    WaterQuality: Optional[LegacyActivityWaterQuality] = Field(default=None)
    Treatment_MechanicalPlant_Information: Optional[
        list[LegacyActivityMechanicalPlantTreatmentInformation]
    ] = Field(default=None)
    Treatment_ChemicalPlant_Information: Optional[
        LegacyActivityChemicalPlantTreatmentInformation
    ] = Field(default=None)
    Pest_Injury_Threshold_Determination: Optional[
        LegacyActivityPestInjuryThresholdDetermination
    ] = Field(default=None)
    chemical_treatment_details: Optional[LegacyChemicalTreatmentDetails] = Field(
        default=None
    )
    Observation_PlantAquatic_Information: Optional[
        LegacyActivityAquaticPlantObservation
    ] = Field(default=None)
    AquaticPlants: Optional[list[LegacyActivityAquaticPlants]] = Field(default=None)
    Monitoring_ChemicalTerrestrialAquaticPlant_Information: Optional[
        list[LegacyActivityChemicalMonitoring]
    ] = Field(default=None)
    Well_Information: Optional[list[LegacyWellInformation]] = Field(default=None)
    Weather_Conditions: Optional[LegacyWeatherConditions] = Field(default=None)
    Microsite_Conditions: Optional[LegacyMicrositeConditions] = Field(default=None)
    Target_Plant_Phenology: Optional[LegacyTargetPlantPhenology] = Field(default=None)
    Biocontrol_Collection_Information: Optional[
        list[LegacyBiocontrolCollectionInformation]
    ] = Field(default=None)
    Monitoring_BiocontrolDispersal_Information: Optional[
        list[LegacyBiocontrolDispersionMonitoring]
    ] = Field(default=None)
    Biocontrol_Release_Information: Optional[
        list[LegacyBiocontrolReleaseInformation]
    ] = Field(default=None)
    Spread_Results: Optional[LegacySpreadResults] = Field(default=None)
    Monitoring_BiocontrolRelease_TerrestrialPlant_Information: Optional[
        list[LegacyBiocontrolReleaseTerrestrialPlantInformation]
    ] = Field(default=None)
    Authorization_Infotmation: Optional[JsonValue] = Field(default=None)
    Monitoring_MechanicalTerrestrialAquaticPlant_Information: Optional[
        list[LegacyMechanicalTerrestrialAquaticMonitoringInformation]
    ] = Field(default=None)


class LegacyActivityFormData(BaseModel):
    activity_data: LegacyActivityData
    activity_type_data: LegacyActivityTypeData
    activity_subtype_data: LegacyActivitySubtypeData
    form_status: Optional[str] = Field(default=None)  # some of them have this field?


class LegacyActivityPayload(BaseModel):
    @model_validator(mode="before")
    def sanitize(cls, values: dict) -> dict:
        # this one is a two-parter -- first strip the unconventional empty values
        if isinstance(values, dict):
            if values.get("species_treated") == "null":
                values["species_treated"] = None
            if isinstance(values.get("jurisdiction"), list):
                values["jurisdiction"] = [
                    v for v in values["jurisdiction"] if v is not None
                ]

        if values.get("copy_geometry") == "null" or "":
            values["copy_geometry"] = None

        # and then remove superfluous keys
        USELESS_KEYS = [
            "null",
            "_id",
            "regional_invasive_species_organization_areas",
            "invasive_plant_management_areas",
            "activity_incoming_data_id",
            "species_positive_full",
            "species_negative_full",
            "activity_subtype_full",
            "created_by_with_guid",
            "updated_by_with_guid",
            "species_treated_full",
            "jurisdiction_display",
            "biogeoclimatic_zones",
            "regional_districts",
            "received_timestamp",
            "media_delete_keys",
            "deleted_timestamp",
            "flnro_districts",
            "albers_northing",
            "albers_easting",
            "well_proximity",
            "moti_districts",
            "utm_northing",
            "utm_easting",
            "utm_zone",
            "geog",
            "geom",
            "centroid",
            "iscurrent",
            "invasive_plant",
            "species_biocontrol_full",
            "version",
            "agency",
            "elevation",
            "ownership",
            "row_number",
            "reviewed_at",
            "reviewed_by",
            "activity_history",
            "sync",
            "extent",
            "photos",
            "media_keys",
            "status",
            "can_edit",
            "can_delete",
        ]

        if isinstance(values, dict):
            for key in USELESS_KEYS:
                if key in values:
                    values.pop(key)

        return values

    activity_id: str
    linked_id: Optional[str] = Field(
        default=None
    )  # this can appear in other places too. which is the authority?
    copy_geometry: Optional[Literal["Yes", "No"]] = Field(
        default=None
    )  # this can appear in other places too. which is the authority?
    batch_id: Optional[str | int] = Field(default=None)
    map_symbol: Optional[str] = Field(default=None)
    media: Optional[list[LegacyActivityMedia]] = Field(default=None)
    geometry: Optional[JsonValue] = Field(default=None)
    short_id: str
    form_data: LegacyActivityFormData
    created_timestamp: Optional[AwareDatetime] = Field(default=None)
    form_status: Optional[str] = Field(default=None)
    created_by: Optional[str] = Field(default=None)
    updated_by: Optional[str] = Field(default=None)
    user_role: Optional[list[int | None]] = Field(default=None)
    sync_status: Optional[str] = Field(default=None)
    activity_type: ActivityType
    activity_subtype: ActivitySubtype
    species_positive: Optional[list[str]] = Field(default=None)
    species_negative: Optional[list[str]] = Field(default=None)
    jurisdiction: Optional[list[str]] = Field(default=None)
    review_status: Optional[str] = Field(default=None)
    initial_autofill_done: Optional[bool] = Field(default=None)
    species_treated: Optional[list[str]] = Field(default=None)
    date_created: Optional[AwareDatetime] = Field(default=None)
    date_updated: Optional[AwareDatetime] = Field(default=None)
    platform_src: Optional[Literal["web", "ios", "android", "unknown"]] = Field(
        default=None
    )


class LegacyActivity(BaseModel):
    activity_id: UUID4
    activity_type: ActivityType
    activity_subtype: ActivitySubtype
    activity_payload: LegacyActivityPayload
