from pydantic import BeforeValidator, PlainSerializer
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


def SerializeCodeTable():
    """
    Serializes CodeTable instance back to its string code.
    """
    return PlainSerializer(
        lambda v: v.code if isinstance(v, models.Model) else v,
        return_type=str,
        when_used="json",  # only fires during serialization output e.g. model_dump(mode='json')
    )


AdjacentLandUseCodeType = Annotated[
    AdjacentLandUseCode,
    MapCodeTable(AdjacentLandUseCode),
    SerializeCodeTable(),
]
AgentLocationFoundCodeType = Annotated[
    AgentLocationFoundCode,
    MapCodeTable(AgentLocationFoundCode),
    SerializeCodeTable(),
]

AgentLocationFoundTerrainCodeType = Annotated[
    AgentLocationFoundTerrainCode,
    MapCodeTable(AgentLocationFoundTerrainCode),
    SerializeCodeTable(),
]

AquaticPlantCodeType = Annotated[
    AquaticPlantCode,
    MapCodeTable(AquaticPlantCode),
    SerializeCodeTable(),
]
AspectCodeType = Annotated[
    AspectCode,
    MapCodeTable(AspectCode),
    SerializeCodeTable(),
]
BaseCodeType = Annotated[
    BaseCode,
    MapCodeTable(BaseCode),
    SerializeCodeTable(),
]
BioAgentCollectionMethodCodeType = Annotated[
    BioAgentCollectionMethodCode,
    MapCodeTable(BioAgentCollectionMethodCode),
    SerializeCodeTable(),
]

BioAgentLifeStageCodeType = Annotated[
    BioAgentLifeStageCode,
    MapCodeTable(BioAgentLifeStageCode),
    SerializeCodeTable(),
]
BiocontrolAgentCodeType = Annotated[
    BiocontrolAgentCode,
    MapCodeTable(BiocontrolAgentCode),
    SerializeCodeTable(),
]
BiocontrolPresenceCodeType = Annotated[
    BiocontrolPresenceCode,
    MapCodeTable(BiocontrolPresenceCode),
    SerializeCodeTable(),
]
ChemicalApplicationMethodDirectCodeType = Annotated[
    ChemicalApplicationMethodDirectCode,
    MapCodeTable(ChemicalApplicationMethodDirectCode),
    SerializeCodeTable(),
]
ChemicalApplicationMethodSprayCodeType = Annotated[
    ChemicalApplicationMethodSprayCode,
    MapCodeTable(ChemicalApplicationMethodSprayCode),
    SerializeCodeTable(),
]
ChemicalPrecautionaryStatementType = Annotated[
    ChemicalPrecautionaryStatement,
    MapCodeTable(ChemicalPrecautionaryStatement),
    SerializeCodeTable(),
]
CloudCoverCodeType = Annotated[
    CloudCoverCode,
    MapCodeTable(CloudCoverCode),
    SerializeCodeTable(),
]
DensityCodeType = Annotated[
    DensityCode,
    MapCodeTable(DensityCode),
    SerializeCodeTable(),
]
DisposalMethodCodeType = Annotated[
    DisposalMethodCode,
    MapCodeTable(DisposalMethodCode),
    SerializeCodeTable(),
]
DistributionCodeType = Annotated[
    DistributionCode,
    MapCodeTable(DistributionCode),
    SerializeCodeTable(),
]
EfficacyManagementRatingCodeType = Annotated[
    EfficacyManagementRatingCode,
    MapCodeTable(EfficacyManagementRatingCode),
    SerializeCodeTable(),
]
EmployerCodeType = Annotated[
    EmployerCode,
    MapCodeTable(EmployerCode),
    SerializeCodeTable(),
]
FundingAgencyCodeType = Annotated[
    FundingAgencyCode,
    MapCodeTable(FundingAgencyCode),
    SerializeCodeTable(),
]
GranularHerbicideCodeType = Annotated[
    GranularHerbicideCode,
    MapCodeTable(GranularHerbicideCode),
    SerializeCodeTable(),
]
InvasivePlantsOnSiteCodeType = Annotated[
    InvasivePlantsOnSiteCode,
    MapCodeTable(InvasivePlantsOnSiteCode),
    SerializeCodeTable(),
]
JurisdictionCodeType = Annotated[
    JurisdictionCode,
    MapCodeTable(JurisdictionCode),
    SerializeCodeTable(),
]
LiquidHerbicideCodeType = Annotated[
    LiquidHerbicideCode,
    MapCodeTable(LiquidHerbicideCode),
    SerializeCodeTable(),
]
MesoslopePositionCodeType = Annotated[
    MesoslopePositionCode,
    MapCodeTable(MesoslopePositionCode),
    SerializeCodeTable(),
]
PestManagementPlanType = Annotated[
    PestManagementPlan,
    MapCodeTable(PestManagementPlan),
    SerializeCodeTable(),
]
PlantLifeStageCodeType = Annotated[
    PlantLifeStageCode,
    MapCodeTable(PlantLifeStageCode),
    SerializeCodeTable(),
]
PlantMechanicalTreatmentMethodCodeType = Annotated[
    PlantMechanicalTreatmentMethodCode,
    MapCodeTable(PlantMechanicalTreatmentMethodCode),
    SerializeCodeTable(),
]
PlantPositionCodeType = Annotated[
    PlantPositionCode,
    MapCodeTable(PlantPositionCode),
    SerializeCodeTable(),
]
PlantsWithBiocontrolType = Annotated[
    PlantsWithBiocontrol,
    MapCodeTable(PlantsWithBiocontrol),
    SerializeCodeTable(),
]
PrecipitationCodeType = Annotated[
    PrecipitationCode,
    MapCodeTable(PrecipitationCode),
    SerializeCodeTable(),
]
ServiceLicenseNumberAndCompanyType = Annotated[
    ServiceLicenseNumberAndCompany,
    MapCodeTable(ServiceLicenseNumberAndCompany),
    SerializeCodeTable(),
]
ShorelineTypeCodeType = Annotated[
    ShorelineTypeCode,
    MapCodeTable(ShorelineTypeCode),
    SerializeCodeTable(),
]
SiteSurfaceShapeCodeType = Annotated[
    SiteSurfaceShapeCode,
    MapCodeTable(SiteSurfaceShapeCode),
    SerializeCodeTable(),
]
SlopePercentCodeType = Annotated[
    SlopePercentCode,
    MapCodeTable(SlopePercentCode),
    SerializeCodeTable(),
]
SoilTextureCodeType = Annotated[
    SoilTextureCode,
    MapCodeTable(SoilTextureCode),
    SerializeCodeTable(),
]
SpecificUseCodeType = Annotated[
    SpecificUseCode,
    MapCodeTable(SpecificUseCode),
    SerializeCodeTable(),
]
SubstrateCodeType = Annotated[
    SubstrateCode,
    MapCodeTable(SubstrateCode),
    SerializeCodeTable(),
]
TerrestrialPlantCodeType = Annotated[
    TerrestrialPlantCode,
    MapCodeTable(TerrestrialPlantCode),
    SerializeCodeTable(),
]
TreatmentEfficacyRatingCodeType = Annotated[
    TreatmentEfficacyRatingCode,
    MapCodeTable(TreatmentEfficacyRatingCode),
    SerializeCodeTable(),
]
WaterbodyFlowCodeType = Annotated[
    WaterbodyFlowCode,
    MapCodeTable(WaterbodyFlowCode),
    SerializeCodeTable(),
]
WaterbodyFlowSeasonalCodeType = Annotated[
    WaterbodyFlowSeasonalCode,
    MapCodeTable(WaterbodyFlowSeasonalCode),
    SerializeCodeTable(),
]
WaterbodyUseCodeType = Annotated[
    WaterbodyUseCode,
    MapCodeTable(WaterbodyUseCode),
    SerializeCodeTable(),
]
WindDirectionCodeType = Annotated[
    WindDirectionCode,
    MapCodeTable(WindDirectionCode),
    SerializeCodeTable(),
]
WaterLevelManagementType = Annotated[
    WaterLevelManagement,
    MapCodeTable(WaterLevelManagement),
    SerializeCodeTable(),
]
WaterbodyTypeCodeType = Annotated[
    WaterbodyTypeCode,
    MapCodeTable(WaterbodyTypeCode),
    SerializeCodeTable(),
]
WaterbodySubstrateCodeType = Annotated[
    WaterbodySubstrateCode,
    MapCodeTable(WaterbodySubstrateCode),
    SerializeCodeTable(),
]
BioAgentMonitoringMethodCodeType = Annotated[
    BioAgentMonitoringMethodCode,
    MapCodeTable(BioAgentMonitoringMethodCode),
    SerializeCodeTable(),
]
HerbicideTypeCodeType = Annotated[
    HerbicideTypeCode,
    MapCodeTable(HerbicideTypeCode),
    SerializeCodeTable(),
]
HerbicideApplicationMethodCodeType = Annotated[
    HerbicideApplicationMethodCode,
    MapCodeTable(HerbicideApplicationMethodCode),
    SerializeCodeTable(),
]
