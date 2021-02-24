import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path=invasivesbc;
  drop view if exists invasivesbc.Treatment_Biological_TerrestrialPlant_Summary ;
  CREATE OR REPLACE VIEW Treatment_Biological_TerrestrialPlant_Summary as (
        select
    record.activity_id,
    record.version,
    record.activity_date_time,
    record.submitted_time,
    record.received_timestamp,
    record.deleted_timestamp,

    record.biogeoclimatic_zones,
    record.regional_invasive_species_organization_areas,
    record.invasive_plant_management_areas,
    record.ownership,
    record.regional_districts,
    record.flnro_districts,
    record.moti_districts,
    record.elevation,
    record.well_proximity,
    record.utm_zone,
    record.utm_northing,
    record.utm_easting,
    record.albers_northing,
    record.albers_easting,

    record.latitude,
    record.longitude,
    record.reported_area,
    record.invasive_species_agency_code,
    record.general_comment,
    record.access_description,
    record.jurisdictions,
    record.project_code
    record.geom,
    record.geog,
    record.media_keys,
        record.invasive_plant_code,
        invasive_plant_codes.code_description as invasive_plant,
        record.classified_area_code,
        classified_area_codes.code_description as classified_area,
        record.applicator1_licence_number,
        record.agent_source,
        biological_agent_codes.code_description as biological_agent,
        record.biological_agent_stage_code,
        record.bioagent_maturity_status_code,
        bioagent_maturity_status_codes.code_description as bioagent_maturity_status

        from invasivesbc.Activity_Treatment_Biological_TerrestrialPlant_with_codes record

left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' and invasive_plant_code_header.valid_to is null
left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id
and record.invasive_plant_code = invasive_plant_codes.code_name

left join code_header classified_area_code_header on classified_area_code_header.code_header_title = 'classified_area_code' and classified_area_code_header.valid_to is null
left join code classified_area_codes on classified_area_codes.code_header_id = classified_area_code_header.code_header_id
and record.classified_area_code = classified_area_codes.code_name

left join code_header biological_agent_code_header on biological_agent_code_header.code_header_title = 'biological_agent_code' and biological_agent_code_header.valid_to is null
left join code biological_agent_codes on biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id
and record.biological_agent_code = biological_agent_codes.code_name

left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' and biological_agent_stage_code_header.valid_to is null
left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id
and record.biological_agent_stage_code = biological_agent_stage_codes.code_name

left join code_header bioagent_maturity_status_code_header on bioagent_maturity_status_code_header.code_header_title = 'bioagent_maturity_status_code' and bioagent_maturity_status_code_header.valid_to is null
left join code bioagent_maturity_status_codes on bioagent_maturity_status_codes.code_header_id = bioagent_maturity_status_code_header.code_header_id
and record.bioagent_maturity_status_code = bioagent_maturity_status_codes.code_name

)


    COMMENT ON VIEW Treatment_Chemical_BiologicalPlant_Summary IS 'View on biological treatments for terrestrial plant specific fields, with code table values resolved';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists invasivesbc.Treatment_Biological_TerrestrialPlant_Summary ;`);
}
