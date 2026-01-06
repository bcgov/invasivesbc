import logging
from dataclasses import dataclass
from typing import Literal

import psycopg
from psycopg.rows import dict_row
from pydantic_core._pydantic_core import ValidationError

from api.legacy_db.migrate import migrate
from api.legacy_db.model_serializer import LegacyActivity
from api.models import (
    WaterbodyUseCode,
    SpecificUseCode,
    AdjacentLandUseCode,
    AgentLocationFoundCode,
    AspectCode,
    BioAgentCollectionMethodCode,
    BiocontrolAgentCode,
    BiocontrolPresenceCode,
    BioAgentLifeStageCode,
    CloudCoverCode,
    EmployerCode,
    WaterbodyFlowCode,
    JurisdictionCode,
    EfficacyManagementRatingCode,
    DisposalMethodCode,
    MesoslopePositionCode,
    PestManagementPlan,
    PlantMechanicalTreatmentMethodCode,
    PlantLifeStageCode,
    PlantPositionCode,
    PrecipitationCode,
    ShorelineTypeCode,
    SiteSurfaceShapeCode,
    SoilTextureCode,
    SubstrateCode,
    BaseCode,
)
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


@dataclass
class CodeMigrationStatistics:
    attempted: int = 0
    succeeded: int = 0
    failed_for_any_reason: int = 0
    not_modified: int = 0
    no_equivalent_code: int = 0


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

            case "employer_code":
                return EmployerCode

            case "inflow_permanent_code":
                return WaterbodyFlowCode

            case "inflow_temporary_code":
                return WaterbodyFlowCode

            case "invasive_code":
                pass

            case "invasive_plant_aquatic_code":
                pass

            case "invasive_plant_change_code":
                pass

            case "invasive_plant_code":
                pass

            case "invasive_plant_code_withbiocontrol":
                pass

            case "invasive_plant_density_code":
                pass

            case "invasive_plant_distribution_code":
                pass

            case "invasive_species_agency_code":
                pass

            case "jurisdiction_code":
                return JurisdictionCode

            case "location_agents_found_code":
                pass

            case "management_efficacy_code":
                return EfficacyManagementRatingCode

            case "mechanical_disposal_code":
                return DisposalMethodCode

            case "mechanical_method_code":
                return PlantMechanicalTreatmentMethodCode

            case "mesoslope_position_code":
                return MesoslopePositionCode

            case "outflow_code":
                return WaterbodyFlowCode

            case "pest_management_plan":
                return PestManagementPlan

            case "plant_life_stage_code":
                return PlantLifeStageCode

            case "plant_position_code":
                return PlantPositionCode

            case "precipitation_code":
                return PrecipitationCode

            case "shoreline_type_code":
                return ShorelineTypeCode

            case "site_surface_shape_code":
                return SiteSurfaceShapeCode

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
        source: Literal["all", "previously-failed", "random-sample", "list"] = "all",
    ):
        stats = ActivityMigrationStatistics(source=source)

        sourcing_query = ""

        match source:
            case "all":
                sourcing_query = f"select activity_id, activity_type, activity_subtype, activity_payload from invasivesbc.activity_incoming_data where iscurrent=true and activity_payload->>'form_status' like 'Submitted'"
            case "random-sample":
                sourcing_query = f"select activity_id, activity_type, activity_subtype, activity_payload from invasivesbc.activity_incoming_data where iscurrent=true and activity_payload->>'form_status' like 'Submitted' and random() >= 0.98"

        with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                result = cursor.execute(sourcing_query)
                for row in result.fetchall():
                    stats.attempted += 1
                    try:
                        parsed_activity = LegacyActivity.model_validate(
                            row, extra="forbid"
                        )
                        if not dry_run:
                            try:
                                new_activity = migrate(parsed_activity)
                                new_activity.save()
                            except:
                                log.warning(
                                    f"building model for {row['activity_id']} failed",
                                    exc_info=True,
                                )

                        stats.succeeded += 1
                    except ValidationError:
                        log.warning(
                            f"initial parse for {row['activity_id']} failed",
                            exc_info=True,
                        )
                        stats.failed_for_any_reason += 1
                        stats.failed_parse += 1

                return stats
