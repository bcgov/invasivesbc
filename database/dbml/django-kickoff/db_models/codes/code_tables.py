from django.db import models
from .base_code import BaseCode

class ActivitySubtypeCode(BaseCode):
  short_id_format= models.CharField(max_length=8)
  class Meta:
    # db_table='"codes"."activity_subtype'
    pass

class AdjacentLandUseCode(BaseCode):
  class Meta:
    # db_table='"codes"."adjacent_land_use"'
    pass

class AquaticPlantCode(BaseCode):
  class Meta:
    # db_table='"codes"."aquatic_plant_code"'
    pass

class AspectCode(BaseCode):
  class Meta:
    # db_table='"codes"."aspect"'
    pass

class BioAgentCollectionMethodCode(BaseCode):
  class Meta:
    # db_table='"codes"."bio_agent_collection_method"'
    pass

class BioAgentLifeStageCode(BaseCode):
  class Meta:
    # db_table='"codes"."bio_agent_life_stage"'
    pass

class BiocontrolAgentCode(BaseCode):
  class Meta:
    # db_table='"codes"."biocontrol_agent"'
    pass

class BiocontrolPresenceCode(BaseCode):
  class Meta:
    # db_table='"codes"."biocontrol_presence"'
    pass

class CloudCoverCode(BaseCode):
  class Meta:
    # db_table='"codes"."cloud_cover"'
    pass

class DensityCode(BaseCode):
  class Meta:
    # db_table='"codes"."density"'
    pass

class DisposalMethodCode(BaseCode):
  class Meta:
    # db_table='"codes"."disposal_method"'
    pass

class DistributionCode(BaseCode):
  class Meta:
    # db_table='"codes"."distribution"'
    pass

class EfficacyManagementRatingCode(BaseCode):
  class Meta:
    # db_table='"codes"."efficacy_management_rating"'
    pass

class EmployerCode(BaseCode):
  class Meta:
    # db_table='"codes"."employer"'
    pass

class FundingAgencyCode(BaseCode):
  class Meta:
    # db_table='"codes"."funding_agency"'
    pass

class InvasivePlantsOnSiteCode(BaseCode):
  class Meta:
    # db_table='"codes"."invasive_plants_on_site"'
    pass

class JurisdictionCode(BaseCode):
  class Meta:
    # db_table='"codes"."jurisdiction"'
    pass

class MesoslopePositionCode(BaseCode):
  class Meta:
    # db_table='"codes"."mesoslope_position"'
    pass

class PlantLifeStageCode(BaseCode):
  class Meta:
    # db_table='"codes"."plant_life_stage"'
    pass

class PlantMechanicalTreatmentMethodCode(BaseCode):
  class Meta:
    # db_table='"codes"."plant_mechanical_treatment_method"'
    pass

class PrecipitationCode(BaseCode):
  class Meta:
    # db_table='"codes"."precipitation"'
    pass

class ShorelineTypeCode(BaseCode):
  class Meta:
    # db_table='"codes"."shoreline_type"'
    pass

class SiteSurfaceShapeCode(BaseCode):
  class Meta:
    # db_table='"codes"."site_surface_shape"'
    pass

class SlopePercentCode(BaseCode):
  class Meta:
    # db_table='"codes"."slope_percent"'
    pass

class SoilTextureCode(BaseCode):
  class Meta:
    # db_table='"codes"."soil_texture"'
    pass

class SpecificUseCode(BaseCode):
  class Meta:
    # db_table='"codes"."specific_use"'
    pass

class SubstrateCode(BaseCode):
  class Meta:
    # db_table='"codes"."substrate_code"'
    pass

class TerrestrialPlantCode(BaseCode):
  class Meta:
    # db_table='"codes"."terrestrial_plant_code"'
    pass

class WaterbodyFlowCode(BaseCode):
  class Meta:
    # db_table='"codes"."waterbody_flow"'
    pass

class WaterbodyFlowSeasonalCode(BaseCode):
  class Meta:
    # db_table='"codes"."waterbody_flow_seasonal"'
    pass

class WaterbodyType(BaseCode):
  class Meta:
    #db_table='"codes"."waterbody_type"'
    pass

class WaterbodyUseCode(BaseCode):
  class Meta:
    # db_table='"codes"."waterbody_use"'
    pass
