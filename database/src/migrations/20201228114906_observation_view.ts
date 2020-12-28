import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  CREATE OR REPLACE VIEW observation_common_fields_view as (
    select
    id as activity_id,
    activity_sub_type as observation_type,
    activity_payload::json->'negative_observation_ind' as negative_observation_ind,
    activity_payload::json->'negative_observation_ind' as negative_observation_ind,
    activity_payload::json->'aquatic_observation_ind' as aquatic_observation_ind,
    activity_payload::json->'primary_user_last_name' as primary_user_last_name,
    activity_payload::json->'secondary_user_first_name' as secondary_user_first_name,
    activity_payload::json->'secondary_user_last_name' as secondary_user_last_name,
    activity_payload::json->'species' as species,
    activity_payload::json->'primary_file_id' as primary_file_id,
    activity_payload::json->'secondary_file_id' as secondary_file_id,
    activity_payload::json->'location_comment' as location_comment,
    activity_payload::json->'general_observation_comment' as general_observation_comment,
    activity_payload::json->'sample_taken_ind' as sample_taken_ind,
    activity_payload::json-> 'sample_label_number' as sample_label_number

    from activity_incoming_data
    where activity_incoming_data.activity_type = 'Observation'
    )
    COMMENT ON VIEW observation_common_fields_view IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists observation_common_fields_view`);
}
