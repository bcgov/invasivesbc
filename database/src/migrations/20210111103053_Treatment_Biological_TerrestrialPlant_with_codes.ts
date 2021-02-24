import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`

set search_path=invasivesbc;
drop view if exists invasivesbc.Activity_Treatment_Biological_TerrestrialPlant_with_codes;
CREATE OR REPLACE VIEW Activity_Treatment_Biological_TerrestrialPlant_with_codes as (
    select
    activity_id,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_code')::text)) as invasive_plant_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'classified_area_code')::text)) as classified_area_code,
    (activity_payload::json->'form_data'->'activity_subtype_data'->'applicator1_licence_number')::text::integer as applicator1_licence_number,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'agent_source')::text)) as agent_source,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'biological_agent_code')::text)) as biological_agent_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'biological_agent_stage_code')::text)) as biological_agent_stage_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'bioagent_maturity_status_code')::text)) as bioagent_maturity_status_code

    from activity_incoming_data
    where activity_incoming_data.activity_type = 'Treatment'
    and activity_incoming_data.activity_subtype = 'Treatment_BiologicalPlant'
    and deleted_timestamp is null
    );
    COMMENT ON VIEW Activity_Treatment_Chemical_BiologicalPlant_with_codes IS 'View on terrestrial plant biological treatments specific fields, with raw code table values';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists invasivesbc.Activity_Biological_Chemical_TerrestrialPlant_with_codes `);
}
