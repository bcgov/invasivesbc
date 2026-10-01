from pydantic import BeforeValidator, PlainSerializer, WithJsonSchema
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
    WithJsonSchema({"type": "string"}),
]
AgentLocationFoundCodeType = Annotated[
    AgentLocationFoundCode,
    MapCodeTable(AgentLocationFoundCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]

AgentLocationFoundTerrainCodeType = Annotated[
    AgentLocationFoundTerrainCode,
    MapCodeTable(AgentLocationFoundTerrainCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]

AquaticPlantCodeType = Annotated[
    AquaticPlantCode,
    MapCodeTable(AquaticPlantCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
AspectCodeType = Annotated[
    AspectCode,
    MapCodeTable(AspectCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
BaseCodeType = Annotated[
    BaseCode,
    MapCodeTable(BaseCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
BioAgentCollectionMethodCodeType = Annotated[
    BioAgentCollectionMethodCode,
    MapCodeTable(BioAgentCollectionMethodCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]

BioAgentLifeStageCodeType = Annotated[
    BioAgentLifeStageCode,
    MapCodeTable(BioAgentLifeStageCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
BiocontrolAgentCodeType = Annotated[
    BiocontrolAgentCode,
    MapCodeTable(BiocontrolAgentCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
BiocontrolPresenceCodeType = Annotated[
    BiocontrolPresenceCode,
    MapCodeTable(BiocontrolPresenceCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
ChemicalApplicationMethodDirectCodeType = Annotated[
    ChemicalApplicationMethodDirectCode,
    MapCodeTable(ChemicalApplicationMethodDirectCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
ChemicalApplicationMethodSprayCodeType = Annotated[
    ChemicalApplicationMethodSprayCode,
    MapCodeTable(ChemicalApplicationMethodSprayCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
ChemicalPrecautionaryStatementType = Annotated[
    ChemicalPrecautionaryStatement,
    MapCodeTable(ChemicalPrecautionaryStatement),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
CloudCoverCodeType = Annotated[
    CloudCoverCode,
    MapCodeTable(CloudCoverCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
DensityCodeType = Annotated[
    DensityCode,
    MapCodeTable(DensityCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
DisposalMethodCodeType = Annotated[
    DisposalMethodCode,
    MapCodeTable(DisposalMethodCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
DistributionCodeType = Annotated[
    DistributionCode,
    MapCodeTable(DistributionCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
EfficacyManagementRatingCodeType = Annotated[
    EfficacyManagementRatingCode,
    MapCodeTable(EfficacyManagementRatingCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
EmployerCodeType = Annotated[
    EmployerCode,
    MapCodeTable(EmployerCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
FundingAgencyCodeType = Annotated[
    FundingAgencyCode,
    MapCodeTable(FundingAgencyCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
    WithJsonSchema({"type": "string"}),
]
GranularHerbicideCodeType = Annotated[
    GranularHerbicideCode,
    MapCodeTable(GranularHerbicideCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
InvasivePlantsOnSiteCodeType = Annotated[
    InvasivePlantsOnSiteCode,
    MapCodeTable(InvasivePlantsOnSiteCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
JurisdictionCodeType = Annotated[
    JurisdictionCode,
    MapCodeTable(JurisdictionCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
LiquidHerbicideCodeType = Annotated[
    LiquidHerbicideCode,
    MapCodeTable(LiquidHerbicideCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
MesoslopePositionCodeType = Annotated[
    MesoslopePositionCode,
    MapCodeTable(MesoslopePositionCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
PestManagementPlanType = Annotated[
    PestManagementPlan,
    MapCodeTable(PestManagementPlan),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
PlantLifeStageCodeType = Annotated[
    PlantLifeStageCode,
    MapCodeTable(PlantLifeStageCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
PlantMechanicalTreatmentMethodCodeType = Annotated[
    PlantMechanicalTreatmentMethodCode,
    MapCodeTable(PlantMechanicalTreatmentMethodCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
PlantPositionCodeType = Annotated[
    PlantPositionCode,
    MapCodeTable(PlantPositionCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
PlantsWithBiocontrolType = Annotated[
    PlantsWithBiocontrol,
    MapCodeTable(PlantsWithBiocontrol),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
PrecipitationCodeType = Annotated[
    PrecipitationCode,
    MapCodeTable(PrecipitationCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
ServiceLicenseNumberAndCompanyType = Annotated[
    ServiceLicenseNumberAndCompany,
    MapCodeTable(ServiceLicenseNumberAndCompany),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
ShorelineTypeCodeType = Annotated[
    ShorelineTypeCode,
    MapCodeTable(ShorelineTypeCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
SiteSurfaceShapeCodeType = Annotated[
    SiteSurfaceShapeCode,
    MapCodeTable(SiteSurfaceShapeCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
SlopePercentCodeType = Annotated[
    SlopePercentCode,
    MapCodeTable(SlopePercentCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
SoilTextureCodeType = Annotated[
    SoilTextureCode,
    MapCodeTable(SoilTextureCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
SpecificUseCodeType = Annotated[
    SpecificUseCode,
    MapCodeTable(SpecificUseCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
SubstrateCodeType = Annotated[
    SubstrateCode,
    MapCodeTable(SubstrateCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
TerrestrialPlantCodeType = Annotated[
    TerrestrialPlantCode,
    MapCodeTable(TerrestrialPlantCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
TreatmentEfficacyRatingCodeType = Annotated[
    TreatmentEfficacyRatingCode,
    MapCodeTable(TreatmentEfficacyRatingCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
WaterbodyFlowCodeType = Annotated[
    WaterbodyFlowCode,
    MapCodeTable(WaterbodyFlowCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
WaterbodyFlowSeasonalCodeType = Annotated[
    WaterbodyFlowSeasonalCode,
    MapCodeTable(WaterbodyFlowSeasonalCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
WaterbodyUseCodeType = Annotated[
    WaterbodyUseCode,
    MapCodeTable(WaterbodyUseCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
WindDirectionCodeType = Annotated[
    WindDirectionCode,
    MapCodeTable(WindDirectionCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
WaterLevelManagementType = Annotated[
    WaterLevelManagement,
    MapCodeTable(WaterLevelManagement),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
WaterbodyTypeCodeType = Annotated[
    WaterbodyTypeCode,
    MapCodeTable(WaterbodyTypeCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
WaterbodySubstrateCodeType = Annotated[
    WaterbodySubstrateCode,
    MapCodeTable(WaterbodySubstrateCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
BioAgentMonitoringMethodCodeType = Annotated[
    BioAgentMonitoringMethodCode,
    MapCodeTable(BioAgentMonitoringMethodCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
HerbicideTypeCodeType = Annotated[
    HerbicideTypeCode,
    MapCodeTable(HerbicideTypeCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
HerbicideApplicationMethodCodeType = Annotated[
    HerbicideApplicationMethodCode,
    MapCodeTable(HerbicideApplicationMethodCode),
    SerializeCodeTable(),
    WithJsonSchema({"type": "string"}),
]
