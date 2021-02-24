import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`

set search_path=invasivesbc;
drop view if exists invasivesbc.Activity_Treatment_Mechanical_TerrestrialPlant_with_codes;
CREATE OR REPLACE VIEW Activity_Treatment_Mechanical_TerrestrialPlant_with_codes as (
    select
    activity_id,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_code')::text)) as invasive_plant_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'mechanical_method_code')::text)) as mechanical_method_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'mechanical_disposal_code')::text)) as mechanical_disposal_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'root_removal_code')::text)) as root_removal_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'soil_disturbance_code')::text)) as soil_disturbance_code,
    (activity_payload::json->'form_data'->'activity_subtype_data'->'signage_on_site')::text::boolean as signage_on_site

    from activity_incoming_data
    where activity_incoming_data.activity_type = 'Treatment'
    and activity_incoming_data.activity_subtype = 'Treatment_MechanicalPlant'
    )
    COMMENT ON VIEW Activity_Treatment_Mechanical_TerrestrialPlant_with_codes IS 'View on terrestrial plant mechanical treatments specific fields, with raw code table values';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists invasivesbc.Activity_Treatment_Mechanical_TerrestrialPlant_with_codes `);
}
