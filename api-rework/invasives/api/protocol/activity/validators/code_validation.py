from pydantic import BeforeValidator
from typing import Annotated, Type
from django.db import models
from api.models.codes import (
    AdjacentLandUseCode,
    AgentLocationFoundCode,
    AgentLocationFoundTerrainCode,
    AquaticPlantCode,
    AspectCode,
    BaseCode,
    BioAgentCollectionMethodCode,
    BioAgentLifeStageCode,
    BiocontrolAgentCode,
    BiocontrolPresenceCode,
    ChemicalApplicationMethodDirectCode,
    ChemicalApplicationMethodSprayCode,
    ChemicalPrecautionaryStatement,
    CloudCoverCode,
    DensityCode,
    DisposalMethodCode,
    DistributionCode,
    EfficacyManagementRatingCode,
    EmployerCode,
    FundingAgencyCode,
    GranularHerbicideCode,
    InvasivePlantsOnSiteCode,
    JurisdictionCode,
    LiquidHerbicideCode,
    MesoslopePositionCode,
    PestManagementPlan,
    PlantLifeStageCode,
    PlantMechanicalTreatmentMethodCode,
    PlantPositionCode,
    PlantsWithBiocontrol,
    PrecipitationCode,
    ServiceLicenseNumberAndCompany,
    ShorelineTypeCode,
    SiteSurfaceShapeCode,
    SlopePercentCode,
    SoilTextureCode,
    SpecificUseCode,
    SubstrateCode,
    TerrestrialPlantCode,
    TreatmentEfficacyRatingCode,
    WaterbodyFlowCode,
    WaterbodyFlowSeasonalCode,
    WaterbodyUseCode,
    WindDirectionCode,
    WaterLevelManagement,
    WaterbodyTypeCode,
    WaterbodySubstrateCode,
    BioAgentMonitoringMethodCode,
    LiquidHerbicideCode,
    GranularHerbicideCode,
    HerbicideTypeCode,
    HerbicideApplicationMethodCode,
)


def MapCodeTable(model: Type[models.Model]):
    """
    Returns a validator that:
    - Accepts Django model instances
    - Accepts strings (code values)
    - Raises ValueError on invalid codes
    - Returns the Django model instance
    """

    def validator(v: str | models.Model) -> models.Model:
        if isinstance(v, model):
            return v

        if not isinstance(v, str):
            raise ValueError(f"Invalid type for code: {v!r}")

        try:
            return model.objects.get(code=v)
        except model.DoesNotExist:
            raise ValueError(f"Invalid selection: '{v}' is not a recognized code.")

    return BeforeValidator(validator)


AdjacentLandUseCodeType = Annotated[
    AdjacentLandUseCode, MapCodeTable(AdjacentLandUseCode)
]
AgentLocationFoundCodeType = Annotated[
    AgentLocationFoundCode, MapCodeTable(AgentLocationFoundCode)
]
AgentLocationFoundTerrainCodeType = Annotated[
    AgentLocationFoundTerrainCode, MapCodeTable(AgentLocationFoundTerrainCode)
]
AquaticPlantCodeType = Annotated[AquaticPlantCode, MapCodeTable(AquaticPlantCode)]
AspectCodeType = Annotated[AspectCode, MapCodeTable(AspectCode)]
BaseCodeType = Annotated[BaseCode, MapCodeTable(BaseCode)]
BioAgentCollectionMethodCodeType = Annotated[
    BioAgentCollectionMethodCode, MapCodeTable(BioAgentCollectionMethodCode)
]
BioAgentLifeStageCodeType = Annotated[
    BioAgentLifeStageCode, MapCodeTable(BioAgentLifeStageCode)
]
BiocontrolAgentCodeType = Annotated[
    BiocontrolAgentCode, MapCodeTable(BiocontrolAgentCode)
]
BiocontrolPresenceCodeType = Annotated[
    BiocontrolPresenceCode, MapCodeTable(BiocontrolPresenceCode)
]
ChemicalApplicationMethodDirectCodeType = Annotated[
    ChemicalApplicationMethodDirectCode,
    MapCodeTable(ChemicalApplicationMethodDirectCode),
]
ChemicalApplicationMethodSprayCodeType = Annotated[
    ChemicalApplicationMethodSprayCode, MapCodeTable(ChemicalApplicationMethodSprayCode)
]
ChemicalPrecautionaryStatementType = Annotated[
    ChemicalPrecautionaryStatement, MapCodeTable(ChemicalPrecautionaryStatement)
]
CloudCoverCodeType = Annotated[CloudCoverCode, MapCodeTable(CloudCoverCode)]
DensityCodeType = Annotated[DensityCode, MapCodeTable(DensityCode)]
DisposalMethodCodeType = Annotated[DisposalMethodCode, MapCodeTable(DisposalMethodCode)]
DistributionCodeType = Annotated[DistributionCode, MapCodeTable(DistributionCode)]
EfficacyManagementRatingCodeType = Annotated[
    EfficacyManagementRatingCode, MapCodeTable(EfficacyManagementRatingCode)
]
EmployerCodeType = Annotated[EmployerCode, MapCodeTable(EmployerCode)]
FundingAgencyCodeType = Annotated[FundingAgencyCode, MapCodeTable(FundingAgencyCode)]
GranularHerbicideCodeType = Annotated[
    GranularHerbicideCode, MapCodeTable(GranularHerbicideCode)
]
InvasivePlantsOnSiteCodeType = Annotated[
    InvasivePlantsOnSiteCode, MapCodeTable(InvasivePlantsOnSiteCode)
]
JurisdictionCodeType = Annotated[JurisdictionCode, MapCodeTable(JurisdictionCode)]
LiquidHerbicideCodeType = Annotated[
    LiquidHerbicideCode, MapCodeTable(LiquidHerbicideCode)
]
MesoslopePositionCodeType = Annotated[
    MesoslopePositionCode, MapCodeTable(MesoslopePositionCode)
]
PestManagementPlanType = Annotated[PestManagementPlan, MapCodeTable(PestManagementPlan)]
PlantLifeStageCodeType = Annotated[PlantLifeStageCode, MapCodeTable(PlantLifeStageCode)]
PlantMechanicalTreatmentMethodCodeType = Annotated[
    PlantMechanicalTreatmentMethodCode, MapCodeTable(PlantMechanicalTreatmentMethodCode)
]
PlantPositionCodeType = Annotated[PlantPositionCode, MapCodeTable(PlantPositionCode)]
PlantsWithBiocontrolType = Annotated[
    PlantsWithBiocontrol, MapCodeTable(PlantsWithBiocontrol)
]
PrecipitationCodeType = Annotated[PrecipitationCode, MapCodeTable(PrecipitationCode)]
ServiceLicenseNumberAndCompanyType = Annotated[
    ServiceLicenseNumberAndCompany, MapCodeTable(ServiceLicenseNumberAndCompany)
]
ShorelineTypeCodeType = Annotated[ShorelineTypeCode, MapCodeTable(ShorelineTypeCode)]
SiteSurfaceShapeCodeType = Annotated[
    SiteSurfaceShapeCode, MapCodeTable(SiteSurfaceShapeCode)
]
SlopePercentCodeType = Annotated[SlopePercentCode, MapCodeTable(SlopePercentCode)]
SoilTextureCodeType = Annotated[SoilTextureCode, MapCodeTable(SoilTextureCode)]
SpecificUseCodeType = Annotated[SpecificUseCode, MapCodeTable(SpecificUseCode)]
SubstrateCodeType = Annotated[SubstrateCode, MapCodeTable(SubstrateCode)]
TerrestrialPlantCodeType = Annotated[
    TerrestrialPlantCode, MapCodeTable(TerrestrialPlantCode)
]
TreatmentEfficacyRatingCodeType = Annotated[
    TreatmentEfficacyRatingCode, MapCodeTable(TreatmentEfficacyRatingCode)
]
WaterbodyFlowCodeType = Annotated[WaterbodyFlowCode, MapCodeTable(WaterbodyFlowCode)]
WaterbodyFlowSeasonalCodeType = Annotated[
    WaterbodyFlowSeasonalCode, MapCodeTable(WaterbodyFlowSeasonalCode)
]
WaterbodyUseCodeType = Annotated[WaterbodyUseCode, MapCodeTable(WaterbodyUseCode)]
WindDirectionCodeType = Annotated[WindDirectionCode, MapCodeTable(WindDirectionCode)]
WaterLevelManagementType = Annotated[
    WaterLevelManagement, MapCodeTable(WaterLevelManagement)
]
WaterbodyTypeCodeType = Annotated[WaterbodyTypeCode, MapCodeTable(WaterbodyTypeCode)]
WaterbodySubstrateCodeType = Annotated[
    WaterbodySubstrateCode, MapCodeTable(WaterbodySubstrateCode)
]
BioAgentMonitoringMethodCodeType = Annotated[
    BioAgentMonitoringMethodCode, MapCodeTable(BioAgentMonitoringMethodCode)
]
HerbicideTypeCodeType = Annotated[HerbicideTypeCode, MapCodeTable(HerbicideTypeCode)]
HerbicideApplicationMethodCodeType = Annotated[
    HerbicideApplicationMethodCode, MapCodeTable(HerbicideApplicationMethodCode)
]
