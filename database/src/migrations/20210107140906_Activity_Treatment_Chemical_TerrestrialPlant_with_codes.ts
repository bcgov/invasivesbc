import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`

  set search_path=invasivesbc;
  drop view if exists invasivesbc.Activity_Treatment_Chemical_TerrestrialPlant_with_codes cascade;
  CREATE OR REPLACE VIEW Activity_Treatment_Chemical_TerrestrialPlant_with_codes as (
      select
      activity_id,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'applicator1_first_name')::text)) as applicator1_first_name,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'applicator1_last_name')::text)) as applicator1_last_name,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'applicator1_licence_number')::text::integer as applicator1_licence_number,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'applicator2_first_name')::text)) as applicator2_first_name,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'applicator2_last_name')::text)) as applicator2_last_name,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'applicator2_licence_number')::text::decimal as applicator2_licence_number,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'pesticide_employer_code')::text)) as pesticide_employer_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'pesticide_use_permit_PUP')::text)) as pesticide_use_permit_PUP,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'pest_management_plan')::text)) as pest_management_plan,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'treatment_issues_code')::text)) as treatment_issues_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'chemical_method_code')::text)) as chemical_method_code,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'temperature')::text::integer as temperature,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'wind_speed')::text::integer as wind_speed,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'wind_direction_code')::text)) as wind_direction_code,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'humidity')::text::integer as humidity
      -- need to work with Shasko on these:
      --invasive_plants
      --herbicide

      from activity_incoming_data
      where activity_incoming_data.activity_type = 'Treatment'
      and activity_incoming_data.activity_subtype = 'Activity_Treatment_ChemicalPlant'
      )
    COMMENT ON VIEW Activity_Treatment_Chemical_TerrestrialPlant_with_codes IS 'View on terrestrial plant chemical treatments specific fields, with raw code table values';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists invasivesbc.Activity_Treatment_Chemical_TerrestrialPlant_with_codes `);
}
