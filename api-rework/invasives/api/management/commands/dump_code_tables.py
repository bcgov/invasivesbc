import itertools
import os
from django.apps import apps
from django.core import serializers
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    MODELS = [
        "api.AdjacentLandUseCode",
        "api.AgentLocationFoundCode",
        "api.AgentLocationFoundTerrainCode",
        "api.AquaticPlantCode",
        "api.AspectCode",
        "api.BioAgentCollectionMethodCode",
        "api.BioAgentMonitoringMethodCode",
        "api.BioAgentLifeStageCode",
        "api.BiocontrolAgentCode",
        "api.BiocontrolPresenceCode",
        "api.ChemicalApplicationMethodDirectCode",
        "api.ChemicalApplicationMethodSprayCode",
        "api.CloudCoverCode",
        "api.DensityCode",
        "api.DisposalMethodCode",
        "api.DistributionCode",
        "api.EfficacyManagementRatingCode",
        "api.EmployerCode",
        "api.FundingAgencyCode",
        "api.GranularHerbicideCode",
        "api.LiquidHerbicideCode",
        "api.HerbicideTypeCode",
        "api.InvasivePlantsOnSiteCode",
        "api.JurisdictionCode",
        "api.MesoslopePositionCode",
        "api.PestManagementPlan",
        "api.ChemicalPrecautionaryStatement",
        "api.PlantPositionCode",
        "api.PlantLifeStageCode",
        "api.PlantMechanicalTreatmentMethodCode",
        "api.PlantsWithBiocontrol",
        "api.PrecipitationCode",
        "api.ServiceLicenseNumberAndCompany",
        "api.ShorelineTypeCode",
        "api.SiteSurfaceShapeCode",
        "api.SlopePercentCode",
        "api.SoilTextureCode",
        "api.SpecificUseCode",
        "api.SubstrateCode",
        "api.TerrestrialPlantCode",
        "api.TreatmentEfficacyRatingCode",
        "api.WaterbodyFlowCode",
        "api.WaterbodyFlowSeasonalCode",
        "api.WaterbodySubstrateCode",
        "api.WaterbodyUseCode",
        "api.WindDirectionCode",
        "api.Role",
    ]

    def add_arguments(self, parser):
        parser.add_argument("output", help="Output path, e.g. fixtures/all.json")
        parser.add_argument(
            "--format",
            default="json",
            choices=["json", "xml", "yaml"],
        )
        parser.add_argument("--indent", type=int, default=2)
        parser.add_argument(
            "--natural-keys",
            action="store_true",
            help="Use natural foreign/primary keys where models define them.",
        )

    def handle(self, *args, **kwargs):
        querysets = []
        for label in self.MODELS:
            try:
                model = apps.get_model(label)
            except LookupError:
                raise CommandError(f"Unknown model: {label}")
            # .iterator() avoids loading each table fully into memory
            querysets.append(model._default_manager.order_by("pk").iterator())

        objects = itertools.chain.from_iterable(querysets)
        os.makedirs(os.path.dirname(kwargs["output"]) or ".", exist_ok=True)
        with open(kwargs["output"], "w", encoding="utf-8") as out:
            serializers.serialize(
                kwargs["format"],
                objects,
                indent=kwargs["indent"],
                stream=out,
                use_natural_foreign_keys=kwargs["natural_keys"],
                use_natural_primary_keys=kwargs["natural_keys"],
            )

        self.stdout.write(self.style.SUCCESS(f"Wrote {kwargs['output']}"))
