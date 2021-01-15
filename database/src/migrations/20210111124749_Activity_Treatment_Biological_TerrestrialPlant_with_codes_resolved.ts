import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path=invasivesbc;
  drop view if exists invasivesbc.Activity_Treatment_Biological_TerrestrialPlant ;
  CREATE OR REPLACE VIEW Activity_Treatment_Biological_TerrestrialPlant as (
        select
        record.activity_id,
        record.invasive_plant_code,
        invasive_plant_codes.description,
        record.classified_area_code,
        classified_area_codes.description,
        record.applicator1_license_number,
        record.agent_source,
        biological_agent_codes.description,
        record.biological_agent_stage_code,
        biological_agent_stage_codes.description,
        record.bioagent_maturity_status_code,
        bioagent_maturity_status_codes.description

        from invasivesbc.Activity_Treatment_Biological_TerrestrialPlant_with_codes

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

left join code_header bioloagent_maturity_status_code_header on bioloagent_maturity_status_code_header.code_header_title = 'bioloagent_maturity_status_code' and bioloagent_maturity_status_code_header.valid_to is null
left join code bioloagent_maturity_status_codes on bioloagent_maturity_status_codes.code_header_id = bioloagent_maturity_status_code_header.code_header_id
and record.bioloagent_maturity_status_code = bioloagent_maturity_status_codes.code_name

)


    COMMENT ON VIEW Activity_Treatment_Chemical_BiologicalPlant IS 'View on biological treatments for terrestrial plant specific fields, with code table values resolved';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists invasivesbc.Activity_Treatment_Biological_TerrestrialPlant ;`);
}
