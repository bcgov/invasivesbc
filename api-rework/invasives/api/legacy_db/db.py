from dataclasses import dataclass
import logging
from typing import Literal

from api.models.activity import Activity
from api.models.codes import (
    AdjacentLandUseCode,
    AgentLocationFoundCode,
    AgentLocationFoundTerrainCode,
    AquaticPlantCode,
    AspectCode,
    BaseCode,
    BioAgentCollectionMethodCode,
    BioAgentLifeStageCode,
    BioAgentMonitoringMethodCode,
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
    HerbicideApplicationMethodCode,
    HerbicideCode,
    HerbicideTypeCode,
    InvasivePlantsOnSiteCode,
    JurisdictionCode,
    LiquidHerbicideCode,
    MesoslopePositionCode,
    PestManagementPlan,
    PlantCode,
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
    WaterLevelManagement,
    WaterbodyFlowCode,
    WaterbodyFlowSeasonalCode,
    WaterbodySubstrateCode,
    WaterbodyTypeCode,
    WaterbodyUseCode,
    WindDirectionCode,
)
from api.models.migrator import ActivityPendingLink
from django.db.models import Q
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING
import psycopg
from psycopg.rows import dict_row

logging.basicConfig(level=logging.DEBUG)
logging.getLogger("psycopg").setLevel(logging.DEBUG)

log = logging.getLogger("legacy-import")


@dataclass
class ActivityMigrationStatistics:
    source: str
    attempted: int = 0
    succeeded: int = 0
    failed_for_any_reason: int = 0
    failed_parse: int = 0
    failed_translate: int = 0
    failed_validate: int = 0
    pending_links_created: int = 0
    pre_existing: int = 0
    clobbered: int = 0


@dataclass
class CodeMigrationStatistics:
    attempted: int = 0
    succeeded: int = 0
    failed_for_any_reason: int = 0
    not_modified: int = 0
    no_equivalent_code: int = 0


@dataclass
class ActivityLinkStatistics:
    attempted: int = 0
    succeeded: int = 0
    failed_for_any_reason: int = 0


class LegacyDB:
    def __init__(self):
        pass

    @staticmethod
    def _code_class_for_code(code: str):
        match code:

            case "adjacent_land_use_code":
                return AdjacentLandUseCode

            case "agent_location_code":
                return AgentLocationFoundCode

            case "aspect_code":
                return AspectCode

            case "bioagent_maturity_status_code":
                pass

            case "biocontrol_collection_code":
                return BioAgentCollectionMethodCode

            case "biocontrol_monitoring_methods_code":
                return BioAgentMonitoringMethodCode

            case "biological_agent_code":
                return BiocontrolAgentCode

            case "biological_agent_presence_code":
                return BiocontrolPresenceCode

            case "biological_agent_stage_code":
                return BioAgentLifeStageCode

            case "chemical_method_direct":
                return ChemicalApplicationMethodDirectCode

            case "chemical_method_spray":
                return ChemicalApplicationMethodSprayCode

            case "cloud_cover_code":
                return CloudCoverCode

            case "collecting_plant_count_code":
                pass

            case "efficacy_code":
                return TreatmentEfficacyRatingCode

            case "employer_code":
                return EmployerCode

            case "granular_herbicide_code":
                return GranularHerbicideCode

            case "inflow_permanent_code":
                return WaterbodyFlowCode

            case "inflow_temporary_code":
                return WaterbodyFlowSeasonalCode

            case "invasive_code":
                pass

            case "invasive_plant_aquatic_code":
                return AquaticPlantCode

            case "invasive_plant_change_code":
                pass

            case "invasive_plant_code":
                return TerrestrialPlantCode

            case "invasive_plant_code_withbiocontrol":
                return PlantsWithBiocontrol

            case "invasive_plant_density_code":
                return DensityCode

            case "invasive_plant_distribution_code":
                return DistributionCode

            case "invasive_species_agency_code":
                return FundingAgencyCode

            case "jurisdiction_code":
                return JurisdictionCode

            case "liquid_herbicide_code":
                return LiquidHerbicideCode

            case "location_agents_found_code":
                return AgentLocationFoundTerrainCode

            case "management_efficacy_code":
                return EfficacyManagementRatingCode

            case "mechanical_disposal_code":
                return DisposalMethodCode

            case "mechanical_method_code":
                return PlantMechanicalTreatmentMethodCode

            case "mesoslope_position_code":
                return MesoslopePositionCode

            case "monitoring_evidence_code":
                return InvasivePlantsOnSiteCode

            case "outflow_code":
                return WaterbodyFlowCode

            case "pest_management_plan":
                return PestManagementPlan

            case "plant_life_stage_code":
                return PlantLifeStageCode

            case "plant_position_code":
                return PlantPositionCode

            case "precautionary_statement_code":
                return ChemicalPrecautionaryStatement

            case "precipitation_code":
                return PrecipitationCode

            case "shoreline_type_code":
                return ShorelineTypeCode

            case "service_license_code":
                return ServiceLicenseNumberAndCompany

            case "site_surface_shape_code":
                return SiteSurfaceShapeCode

            case "slope_code":
                return SlopePercentCode

            case "soil_texture_code":
                return SoilTextureCode

            case "specific_use_code":
                return SpecificUseCode

            case "surface_substrate_code":
                return SubstrateCode

            case "waterbody_use_code":
                return WaterbodyUseCode

            case "granular_herbicide_code":
                return GranularHerbicideCode

            case "liquid_herbicide_code":
                return LiquidHerbicideCode

            case "herbicide_type_code":
                return HerbicideTypeCode

            case "chemical_method_code":
                return HerbicideApplicationMethodCode

            case _:
                return None

    @staticmethod
    def add_hardcoded_codes():
        ap = AquaticPlantCode.objects.all()
        tp = TerrestrialPlantCode.objects.all()

        PlantCode.objects.bulk_create(
            [PlantCode(code=p.code, full=p.full) for p in ap], ignore_conflicts=True
        )
        PlantCode.objects.bulk_create(
            [PlantCode(code=p.code, full=p.full) for p in tp], ignore_conflicts=True
        )

        lherb = LiquidHerbicideCode.objects.all()
        gherb = GranularHerbicideCode.objects.all()
        HerbicideCode.objects.bulk_create(
            [HerbicideCode(code=h.code, full=h.full) for h in lherb],
            ignore_conflicts=True,
        )
        HerbicideCode.objects.bulk_create(
            [HerbicideCode(code=h.code, full=h.full) for h in gherb],
            ignore_conflicts=True,
        )
        WindDirectionCode.objects.update_or_create(
            code="No Wind", full="No Wind", code_sort_order=10
        )
        WindDirectionCode.objects.update_or_create(
            code="N", full="North", code_sort_order=20
        )
        WindDirectionCode.objects.update_or_create(
            code="NE", full="Northeast", code_sort_order=30
        )
        WindDirectionCode.objects.update_or_create(
            code="E", full="East", code_sort_order=40
        )
        WindDirectionCode.objects.update_or_create(
            code="SE", full="Southeast", code_sort_order=50
        )
        WindDirectionCode.objects.update_or_create(
            code="S", full="South", code_sort_order=60
        )
        WindDirectionCode.objects.update_or_create(
            code="SW", full="Southwest", code_sort_order=70
        )
        WindDirectionCode.objects.update_or_create(
            code="W", full="West", code_sort_order=80
        )
        WindDirectionCode.objects.update_or_create(
            code="NW", full="Northwest", code_sort_order=90
        )

        WaterLevelManagement.objects.update_or_create(
            code="None", full="None", code_sort_order=10
        )
        WaterLevelManagement.objects.update_or_create(
            code="Dam", full="Dam", code_sort_order=20
        )
        WaterLevelManagement.objects.update_or_create(
            code="Other", full="Other", code_sort_order=30
        )
        WaterLevelManagement.objects.update_or_create(
            code="Station", full="Station", code_sort_order=40
        )
        WaterLevelManagement.objects.update_or_create(
            code="Weir", full="Weir", code_sort_order=50
        )

        WaterbodyTypeCode.objects.update_or_create(
            code="Bog", full="Bog", code_sort_order=10
        )

        WaterbodyTypeCode.objects.update_or_create(
            code="Confined Pond", full="Confined Pond", code_sort_order=20
        )
        WaterbodyTypeCode.objects.update_or_create(
            code="Discharging Pond", full="Discharging Pond", code_sort_order=30
        )
        WaterbodyTypeCode.objects.update_or_create(
            code="Ditch", full="Ditch", code_sort_order=40
        )
        WaterbodyTypeCode.objects.update_or_create(
            code="Intertidal", full="Intertidal", code_sort_order=50
        )
        WaterbodyTypeCode.objects.update_or_create(
            code="Lake", full="Lake", code_sort_order=60
        )
        WaterbodyTypeCode.objects.update_or_create(
            code="River", full="River", code_sort_order=70
        )
        WaterbodyTypeCode.objects.update_or_create(
            code="Slough", full="Slough", code_sort_order=80
        )
        WaterbodyTypeCode.objects.update_or_create(
            code="Stream", full="Stream", code_sort_order=90
        )
        WaterbodyTypeCode.objects.update_or_create(
            code="Wetland", full="Wetland", code_sort_order=100
        )

        WaterbodySubstrateCode.objects.update_or_create(
            code="Clay", full="Clay", code_sort_order=10
        )
        WaterbodySubstrateCode.objects.update_or_create(
            code="Cobble", full="Cobble", code_sort_order=20
        )
        WaterbodySubstrateCode.objects.update_or_create(
            code="Gravel", full="Gravel", code_sort_order=30
        )
        WaterbodySubstrateCode.objects.update_or_create(
            code="Rip-rap", full="Rip-rap", code_sort_order=40
        )
        WaterbodySubstrateCode.objects.update_or_create(
            code="Sand", full="Sand", code_sort_order=50
        )
        WaterbodySubstrateCode.objects.update_or_create(
            code="Silt/Organic", full="Silt/Organic", code_sort_order=60
        )

    @staticmethod
    def migrate_codes(dry_run=False):
        # language=PostgreSQL
        query = """select c.code_name                  as code_name,
                      c.code_description           as code_description,
                      c.code_sort_order            as sort_order,
                      ch.code_header_name          as header_name,
                      cc.code_category_name        as category,
                      cc.code_category_description as category_description,
                      cc.code_category_title       as category_title
               from code c
                      join code_header ch on c.code_header_id = ch.code_header_id
                      join code_category cc on cc.code_category_id = ch.code_category_id
               order by code_category_title, code_header_name;"""

        stats = CodeMigrationStatistics()

        if not dry_run:
            LegacyDB.add_hardcoded_codes()

        with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                previously_warned_about = []

                result = cursor.execute(query)
                for row in result.fetchall():
                    stats.attempted += 1
                    code_class: BaseCode | None = LegacyDB._code_class_for_code(
                        row["header_name"]
                    )
                    if code_class is not None:
                        found = code_class.objects.filter(code=row["code_name"]).first()
                        if found is not None:
                            log.debug(
                                f"{row['header_name']}:{row['code_name']} is already migrated"
                            )
                            stats.not_modified += 1
                        else:
                            try:
                                create = code_class()
                                create.code = row["code_name"]
                                create.full = row["code_description"]
                                create.code_sort_order = row["sort_order"]
                                create.save()
                                stats.succeeded += 1
                            except Exception as e:
                                log.error(
                                    f"{row['header_name']}:{row['code_name']} could not be migrated",
                                    exc_info=True,
                                )
                                stats.failed_for_any_reason += 1
                    else:
                        stats.no_equivalent_code += 1
                        if row["header_name"] not in previously_warned_about:
                            previously_warned_about.append(row["header_name"])
                            log.warning(
                                f"{row['header_name']} has no equivalent code table"
                            )

        return stats

    @staticmethod
    def migrate_activities(
        dry_run=False,
        clobber=False,
        source: Literal["all", "previously-failed", "random-sample", "single"] = "all",
        restrict_to_subtype: str | None = None,
        pk=None,
    ):

        from api.tasks import import_single_activity

        sourcing_query = ""
        sourcing_query_parameters = {}

        match source:
            case "all":
                sourcing_query = "select activity_id from invasivesbc.activity_incoming_data where iscurrent=true and form_status like 'Submitted' and deleted_timestamp is NULL"
            case "random-sample":
                sourcing_query = "select activity_id from invasivesbc.activity_incoming_data where iscurrent=true and form_status like 'Submitted' and deleted_timestamp is NULL and random() >= 0.98"
            case "single":
                sourcing_query = "select activity_id from invasivesbc.activity_incoming_data where iscurrent=true and form_status like 'Submitted' and deleted_timestamp is NULL and activity_id = %(pk)s"
                sourcing_query_parameters["pk"] = pk

        if restrict_to_subtype is not None:
            sourcing_query = (
                f"{sourcing_query} and activity_subtype = %(activity_subtype)s"
            )
            sourcing_query_parameters["activity_subtype"] = restrict_to_subtype

        count = 0

        with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                result = cursor.execute(sourcing_query, sourcing_query_parameters)
                for row in result.fetchall():
                    activity_id = row["activity_id"]
                    count = count + 1
                    logging.info(
                        import_single_activity.apply(
                            args=(activity_id,),
                            kwargs={"dry_run": dry_run, "clobber": clobber},
                        )
                    )  # not an async call

        logging.info("run complete")

    @staticmethod
    def migrate_links():
        stats = ActivityLinkStatistics()
        to_action = ActivityPendingLink.objects.filter(
            Q(actioned=False) | Q(success=False)
        )

        for link in to_action:
            logging.debug(
                f"{"re-trying" if link.actioned else "creating" } link {link.from_activity_id}<->{link.to_activity_id}"
            )
            stats.attempted += 1
            try:
                from_activity = Activity.objects.get(id=link.from_activity_id)
                to_activity = Activity.objects.get(id=link.to_activity_id)
                from_activity.linked_activities.add(to_activity)
                from_activity.save()
                link.success = True
                stats.succeeded += 1
            except Activity.DoesNotExist as e:
                logging.warning("Either the `from` or `to` activity does not exist")
                link.success = False
                stats.failed_for_any_reason += 1
            finally:
                link.actioned = True
                link.save()

        return stats
