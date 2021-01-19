import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  drop VIEW if exists Observation_Summary cascade;
  CREATE OR REPLACE VIEW Observation_Summary as (
    select
    id as activity_id,
    activity_sub_type as observation_type,
    activity_payload::json->'form_data'->'activity_type_data'->'negative_obs_ind' as negative_observation_ind from activity_incoming_data,
    activity_payload::json->'form_data'->'activity_type_data'->'observer_last_name' as primary_user_last_name,
    activity_payload::json->'form_data'->'activity_type_data'->'observer_first_name' as primary_user_first_name,
    activity_payload::json->'form_data'->'acitivity_subtype_data'->invasive_plant_code' as invasive_plant_code,
    activity_payload::json->'primary_file_id' as primary_file_id__NEEDS_VERIFY,
    activity_payload::json->'secondary_file_id' as secondary_file_id__NEEDS_VERIFY,
    activity_payload::json->'location_comment' as location_comment__NEEDS_VERIFY,
    activity_payload::json->'form_data'->'activity_data'->'general_comment as general_observation_comment__NEEDS_VERIFY,
    activity_payload::json->'sample_taken_ind' as sample_taken_ind_NEEDS_VERIFY,
    activity_payload::json-> 'sample_label_number' as sample_label_number__NEEDS_VERIFY

    from activity_incoming_data
    where activity_incoming_data.activity_type = 'Observation'
    )
    COMMENT ON VIEW Observation_Summary IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists Observation_Summary cascade`);
}
