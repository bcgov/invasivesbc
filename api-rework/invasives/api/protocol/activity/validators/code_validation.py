from pydantic import AfterValidator
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
    Returns a function that checks if a code exists in the specified model.
    """

    def validator(v: str) -> str:
        if not model.objects.filter(code=v).exists():
            raise ValueError(f"Invalid selection: '{v}' is not a recognized code.")
        return v

    return AfterValidator(validator)


AdjacentLandUseCodeType = Annotated[str, MapCodeTable(AdjacentLandUseCode)]
AgentLocationFoundCodeType = Annotated[str, MapCodeTable(AgentLocationFoundCode)]
AgentLocationFoundTerrainCodeType = Annotated[
    str, MapCodeTable(AgentLocationFoundTerrainCode)
]
AquaticPlantCodeType = Annotated[str, MapCodeTable(AquaticPlantCode)]
AspectCodeType = Annotated[str, MapCodeTable(AspectCode)]
BaseCodeType = Annotated[str, MapCodeTable(BaseCode)]
BioAgentCollectionMethodCodeType = Annotated[
    str, MapCodeTable(BioAgentCollectionMethodCode)
]
BioAgentLifeStageCodeType = Annotated[str, MapCodeTable(BioAgentLifeStageCode)]
BiocontrolAgentCodeType = Annotated[str, MapCodeTable(BiocontrolAgentCode)]
BiocontrolPresenceCodeType = Annotated[str, MapCodeTable(BiocontrolPresenceCode)]
ChemicalApplicationMethodDirectCodeType = Annotated[
    str, MapCodeTable(ChemicalApplicationMethodDirectCode)
]
ChemicalApplicationMethodSprayCodeType = Annotated[
    str, MapCodeTable(ChemicalApplicationMethodSprayCode)
]
ChemicalPrecautionaryStatementType = Annotated[
    str, MapCodeTable(ChemicalPrecautionaryStatement)
]
CloudCoverCodeType = Annotated[str, MapCodeTable(CloudCoverCode)]
DensityCodeType = Annotated[str, MapCodeTable(DensityCode)]
DisposalMethodCodeType = Annotated[str, MapCodeTable(DisposalMethodCode)]
DistributionCodeType = Annotated[str, MapCodeTable(DistributionCode)]
EfficacyManagementRatingCodeType = Annotated[
    str, MapCodeTable(EfficacyManagementRatingCode)
]
EmployerCodeType = Annotated[str, MapCodeTable(EmployerCode)]
FundingAgencyCodeType = Annotated[str, MapCodeTable(FundingAgencyCode)]
GranularHerbicideCodeType = Annotated[str, MapCodeTable(GranularHerbicideCode)]
InvasivePlantsOnSiteCodeType = Annotated[str, MapCodeTable(InvasivePlantsOnSiteCode)]
JurisdictionCodeType = Annotated[str, MapCodeTable(JurisdictionCode)]
LiquidHerbicideCodeType = Annotated[str, MapCodeTable(LiquidHerbicideCode)]
MesoslopePositionCodeType = Annotated[str, MapCodeTable(MesoslopePositionCode)]
PestManagementPlanType = Annotated[str, MapCodeTable(PestManagementPlan)]
PlantLifeStageCodeType = Annotated[str, MapCodeTable(PlantLifeStageCode)]
PlantMechanicalTreatmentMethodCodeType = Annotated[
    str, MapCodeTable(PlantMechanicalTreatmentMethodCode)
]
PlantPositionCodeType = Annotated[str, MapCodeTable(PlantPositionCode)]
PrecipitationCodeType = Annotated[str, MapCodeTable(PrecipitationCode)]
ServiceLicenseNumberAndCompanyType = Annotated[
    str, MapCodeTable(ServiceLicenseNumberAndCompany)
]
ShorelineTypeCodeType = Annotated[str, MapCodeTable(ShorelineTypeCode)]
SiteSurfaceShapeCodeType = Annotated[str, MapCodeTable(SiteSurfaceShapeCode)]
SlopePercentCodeType = Annotated[str, MapCodeTable(SlopePercentCode)]
SoilTextureCodeType = Annotated[str, MapCodeTable(SoilTextureCode)]
SpecificUseCodeType = Annotated[str, MapCodeTable(SpecificUseCode)]
SubstrateCodeType = Annotated[str, MapCodeTable(SubstrateCode)]
TerrestrialPlantCodeType = Annotated[str, MapCodeTable(TerrestrialPlantCode)]
TreatmentEfficacyRatingCodeType = Annotated[
    str, MapCodeTable(TreatmentEfficacyRatingCode)
]
WaterbodyFlowCodeType = Annotated[str, MapCodeTable(WaterbodyFlowCode)]
WaterbodyFlowSeasonalCodeType = Annotated[str, MapCodeTable(WaterbodyFlowSeasonalCode)]
WaterbodyUseCodeType = Annotated[str, MapCodeTable(WaterbodyUseCode)]
WindDirectionCodeType = Annotated[str, MapCodeTable(WindDirectionCode)]
WaterLevelManagementType = Annotated[str, MapCodeTable(WaterLevelManagement)]
WaterbodyTypeCodeType = Annotated[str, MapCodeTable(WaterbodyTypeCode)]
WaterbodySubstrateCodeType = Annotated[str, MapCodeTable(WaterbodySubstrateCode)]
BioAgentMonitoringMethodCodeType = Annotated[
    str, MapCodeTable(BioAgentMonitoringMethodCode)
]
HerbicideTypeCodeType = Annotated[str, MapCodeTable(HerbicideTypeCode)]
HerbicideApplicationMethodCodeType = Annotated[
    str, MapCodeTable(HerbicideApplicationMethodCode)
]
