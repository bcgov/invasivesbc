from itertools import chain

from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.viewsets import ViewSet

from api.models.codes.code_tables import *
from api.permissions import HasAdminRole
from api.serializers.code import CodeSerializer


class CodeViewSet(ViewSet):
    permission_classes = [HasAdminRole]
    http_method_names = ["get"]

    code_models = [
        AdjacentLandUseCode,
        AgentLocationFoundCode,
        AgentLocationFoundTerrainCode,
        AquaticPlantCode,
        AspectCode,
        BioAgentCollectionMethodCode,
        BioAgentMonitoringMethodCode,
        BioAgentLifeStageCode,
        BiocontrolAgentCode,
        BiocontrolPresenceCode,
        ChemicalApplicationMethodDirectCode,
        ChemicalApplicationMethodSprayCode,
        CloudCoverCode,
        DensityCode,
        DisposalMethodCode,
        DistributionCode,
        EfficacyManagementRatingCode,
        EmployerCode,
        FundingAgencyCode,
        GranularHerbicideCode,
        LiquidHerbicideCode,
        InvasivePlantsOnSiteCode,
        JurisdictionCode,
        MesoslopePositionCode,
        PestManagementPlan,
        ChemicalPrecautionaryStatement,
        PlantPositionCode,
        PlantLifeStageCode,
        PlantMechanicalTreatmentMethodCode,
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
        WaterbodySubstrateCode,
        WaterbodyUseCode,
        WindDirectionCode,
    ]

    def list(self, request):
        result = chain(x.objects.all().iterator() for x in self.code_models)

        serializer = CodeSerializer(result, many=True)

        return Response(data=serializer.data, status=HTTP_200_OK)
