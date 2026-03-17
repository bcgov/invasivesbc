from itertools import chain
from pprint import pprint

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.viewsets import ViewSet

from api.models.codes.code_tables import *
from api.serializers.code import CodeSerializer


class CodeViewSet(ViewSet):
    permission_classes = [AllowAny]
    http_method_names = ["get"]

    code_models = [
        AdjacentLandUseCode,
        AgentLocationFoundCode,
        AquaticPlantCode,
        AspectCode,
        BioAgentCollectionMethodCode,
        BioAgentLifeStageCode,
        BiocontrolAgentCode,
        BiocontrolPresenceCode,
        CloudCoverCode,
        DensityCode,
        DisposalMethodCode,
        DistributionCode,
        EfficacyManagementRatingCode,
        EmployerCode,
        FundingAgencyCode,
        InvasivePlantsOnSiteCode,
        JurisdictionCode,
        MesoslopePositionCode,
        PestManagementPlan,
        ChemicalPrecautionaryStatement,
        PlantPositionCode,
        PlantLifeStageCode,
        PlantMechanicalTreatmentMethodCode,
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
    ]

    def list(self, request):
        result = chain(x.objects.all().iterator() for x in self.code_models)

        serializer = CodeSerializer(result, many=True)

        return Response(data=serializer.data, status=HTTP_200_OK)
