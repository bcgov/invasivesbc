from .base_code import BaseCode


class AdjacentLandUseCode(BaseCode):
    class Meta:
        db_table = '"codes"."adjacent_land_use"'


class HerbicideCode(BaseCode):
    class Meta:
        db_table = '"codes"."herbicide"'
        db_table_comment = "All herbicide codes non-specific to type"


class PlantCode(BaseCode):
    class Meta:
        db_table = '"codes"."plant_code"'
        db_table_comment = "All plant codes non-specific to type"


class AgentLocationFoundCode(BaseCode):
    """Plant location where agents found e.g.: 'Stem base', 'Seedhead"""

    class Meta:
        db_table = '"codes"."agent_location_found"'


class AgentLocationFoundTerrainCode(BaseCode):
    """Generic terrain details where agent was found e.g.: 'Slope', 'Edge of Patch'"""

    class Meta:
        db_table = '"codes"."agent_location_found_terrain"'


class AquaticPlantCode(BaseCode):
    class Meta:
        db_table = '"codes"."aquatic_plant_code"'


class AspectCode(BaseCode):
    class Meta:
        db_table = '"codes"."aspect"'


class BioAgentCollectionMethodCode(BaseCode):
    class Meta:
        db_table = '"codes"."bio_agent_collection_method"'


class BioAgentMonitoringMethodCode(BaseCode):
    class Meta:
        db_table = '"codes"."bio_agent_monitoring_method"'


class BioAgentLifeStageCode(BaseCode):
    class Meta:
        db_table = '"codes"."bio_agent_life_stage"'


class BiocontrolAgentCode(BaseCode):
    class Meta:
        db_table = '"codes"."biocontrol_agent"'


class BiocontrolPresenceCode(BaseCode):
    class Meta:
        db_table = '"codes"."biocontrol_presence"'


class ChemicalApplicationMethodDirectCode(BaseCode):
    class Meta:
        db_table = '"codes"."chemical_application_method_direct"'


class ChemicalApplicationMethodSprayCode(BaseCode):
    class Meta:
        db_table = '"codes"."chemical_application_method_spray"'


class CloudCoverCode(BaseCode):
    class Meta:
        db_table = '"codes"."cloud_cover"'


class DensityCode(BaseCode):
    class Meta:
        db_table = '"codes"."density"'


class DisposalMethodCode(BaseCode):
    class Meta:
        db_table = '"codes"."disposal_method"'


class DistributionCode(BaseCode):
    class Meta:
        db_table = '"codes"."distribution"'


class EfficacyManagementRatingCode(BaseCode):
    class Meta:
        db_table = '"codes"."efficacy_management_rating"'


class EmployerCode(BaseCode):
    class Meta:
        db_table = '"codes"."employer"'


class FundingAgencyCode(BaseCode):
    class Meta:
        db_table = '"codes"."funding_agency"'


class InvasivePlantsOnSiteCode(BaseCode):
    class Meta:
        db_table = '"codes"."invasive_plants_on_site"'


class JurisdictionCode(BaseCode):
    class Meta:
        db_table = '"codes"."jurisdiction"'


class MesoslopePositionCode(BaseCode):
    class Meta:
        db_table = '"codes"."mesoslope_position"'


class PestManagementPlan(BaseCode):
    class Meta:
        db_table = '"codes"."pest_management_plan"'


class ChemicalPrecautionaryStatement(BaseCode):
    class Meta:
        db_table = '"codes"."chemical_precautionary_statement"'


class PlantPositionCode(BaseCode):
    class Meta:
        db_table = '"codes"."plant_position"'


class PlantLifeStageCode(BaseCode):
    class Meta:
        db_table = '"codes"."plant_life_stage"'


class PlantMechanicalTreatmentMethodCode(BaseCode):
    class Meta:
        db_table = '"codes"."plant_mechanical_treatment_method"'


class PlantsWithBiocontrol(BaseCode):
    class Meta:
        db_table = '"codes"."plants_with_biocontrol"'


class PrecipitationCode(BaseCode):
    class Meta:
        db_table = '"codes"."precipitation"'


class ServiceLicenseNumberAndCompany(BaseCode):
    class Meta:
        db_table = '"codes"."service_license_number_and_company"'


class ShorelineTypeCode(BaseCode):
    class Meta:
        db_table = '"codes"."shoreline_type"'


class SiteSurfaceShapeCode(BaseCode):
    class Meta:
        db_table = '"codes"."site_surface_shape"'


class SlopePercentCode(BaseCode):
    class Meta:
        db_table = '"codes"."slope_percent"'


class SoilTextureCode(BaseCode):
    class Meta:
        db_table = '"codes"."soil_texture"'


class SpecificUseCode(BaseCode):
    class Meta:
        db_table = '"codes"."specific_use"'


class SubstrateCode(BaseCode):
    class Meta:
        db_table = '"codes"."substrate_code"'


class TerrestrialPlantCode(BaseCode):
    class Meta:
        db_table = '"codes"."terrestrial_plant_code"'


class TreatmentEfficacyRatingCode(BaseCode):
    class Meta:
        db_table = '"codes"."treatment_efficacy_rating"'


class WaterbodyFlowCode(BaseCode):
    class Meta:
        db_table = '"codes"."waterbody_flow"'


class WaterbodyFlowSeasonalCode(BaseCode):
    class Meta:
        db_table = '"codes"."waterbody_flow_seasonal"'


class WaterbodyUseCode(BaseCode):
    class Meta:
        db_table = '"codes"."waterbody_use"'


class WaterbodyTypeCode(BaseCode):
    class Meta:
        db_table = '"codes"."waterbody_type"'


class WaterbodySubstrateCode(BaseCode):
    class Meta:
        db_table = '"codes"."waterbody_substrate"'


class WindDirectionCode(BaseCode):
    class Meta:
        db_table = '"codes"."wind_direction"'


class WaterLevelManagement(BaseCode):
    class Meta:
        db_table = '"codes"."water_level_management"'


class GranularHerbicideCode(BaseCode):
    class Meta:
        db_table = '"codes"."granular_herbicide"'


class LiquidHerbicideCode(BaseCode):
    class Meta:
        db_table = '"codes"."liquid_herbicide"'


class HerbicideTypeCode(BaseCode):
    class Meta:
        db_table = '"codes"."herbicide_type"'


class HerbicideApplicationMethodCode(BaseCode):
    class Meta:
        db_table = '"codes"."herbicide_application_method"'
