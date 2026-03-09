from dataclasses import dataclass
import logging
from typing import Literal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
import django.db.transaction as transaction
import psycopg
from psycopg.rows import dict_row
from pydantic_core._pydantic_core import ValidationError

from api.legacy_db.migrate import migrate
from api.legacy_db.migration_errors import MigrationErrors
from api.legacy_db.model_serializer import LegacyActivity
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
    BiocontrolAgentCode,
    BiocontrolPresenceCode,
    ChemicalPrecautionaryStatement,
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
)
from api.models.migrator import ActivityPendingLink, MigrationError
from api.models.migrator.activity_migration_status import ActivityMigrationStatus
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING

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

            case "biological_agent_code":
                return BiocontrolAgentCode

            case "biological_agent_presence_code":
                return BiocontrolPresenceCode

            case "biological_agent_stage_code":
                return BioAgentLifeStageCode

            case "cloud_cover_code":
                return CloudCoverCode

            case "collecting_plant_count_code":
                pass

            case "efficacy_code":
                return TreatmentEfficacyRatingCode

            case "employer_code":
                return EmployerCode

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
                pass

            case "invasive_plant_density_code":
                return DensityCode

            case "invasive_plant_distribution_code":
                return DistributionCode

            case "invasive_species_agency_code":
                return FundingAgencyCode

            case "jurisdiction_code":
                return JurisdictionCode

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

            case _:
                return None

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
        stats = ActivityMigrationStatistics(source=source)

        sourcing_query = ""

        match source:
            case "all":
                sourcing_query = f"select activity_id, activity_type, activity_subtype, activity_payload from invasivesbc.activity_incoming_data where iscurrent=true and activity_payload->>'form_status' like 'Submitted'"
            case "random-sample":
                sourcing_query = f"select activity_id, activity_type, activity_subtype, activity_payload from invasivesbc.activity_incoming_data where iscurrent=true and activity_payload->>'form_status' like 'Submitted' and random() >= 0.98"
            case "single":
                sourcing_query = f"select activity_id, activity_type, activity_subtype, activity_payload from invasivesbc.activity_incoming_data where iscurrent=true and activity_payload->>'form_status' like 'Submitted' and activity_id = '{pk}'"

        if restrict_to_subtype is not None:
            sourcing_query = (
                f"{sourcing_query} and activity_subtype = '{restrict_to_subtype}'"
            )

        with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                result = cursor.execute(sourcing_query)
                for row in result.fetchall():
                    errors = MigrationErrors(errors=[])
                    migration_status = ActivityMigrationStatus.objects.filter(
                        activity_id=row["activity_id"]
                    ).first()
                    pre_existing = False
                    if migration_status is not None:
                        stats.pre_existing += 1
                        pre_existing = True
                        if clobber:
                            log.debug(
                                f"Clobbering old records for {row['activity_id']}"
                            )
                            migration_status.delete()
                            migration_status = ActivityMigrationStatus(
                                activity_id=row["activity_id"]
                            )
                            Activity.objects.filter(id=row["activity_id"]).delete()
                            stats.clobbered += 1
                    else:
                        migration_status = ActivityMigrationStatus(
                            activity_id=row["activity_id"]
                        )

                    stats.attempted += 1
                    try:
                        parsed_activity = LegacyActivity.model_validate(
                            row, extra="forbid"
                        )
                        if not dry_run and (not pre_existing or clobber):
                            try:
                                with transaction.atomic():
                                    new_activity = migrate(parsed_activity)
                                    stats.succeeded += 1
                                    migration_status.success = True

                                    if (
                                        parsed_activity.activity_payload.form_data.activity_type_data.linked_id
                                        is not None
                                        and parsed_activity.activity_payload.form_data.activity_type_data.linked_id
                                        != ""
                                    ):
                                        ActivityPendingLink.objects.create(
                                            from_activity_id=new_activity.id,
                                            to_activity_id=parsed_activity.activity_payload.form_data.activity_type_data.linked_id,
                                        )
                                        stats.pending_links_created += 1

                            except DjangoValidationError as e:
                                log.warning(
                                    f"validation for {row['activity_id']} failed",
                                    exc_info=True,
                                )
                                errors.errors.append(("validation", e.__str__()))
                                stats.failed_validate += 1
                            except Exception as e:
                                log.warning(
                                    f"building model for {row['activity_id']} failed",
                                    exc_info=True,
                                )
                                stats.failed_for_any_reason += 1

                    except ValidationError as e:
                        log.warning(
                            f"initial parse for {row['activity_id']} failed",
                            exc_info=True,
                        )
                        errors.errors.append(
                            ("parse failed", e.__str__()),
                        )
                        stats.failed_for_any_reason += 1
                        stats.failed_parse += 1
                    finally:
                        if not dry_run:
                            migration_status.save()
                            if len(errors.errors) > 0:
                                for error in errors.errors:
                                    logging.warning("error")
                                    MigrationError.objects.create(
                                        migration_status=migration_status,
                                        reason=error[0],
                                        extended_status=error[1],
                                    )

                return stats

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
