import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    -- ### Creating View: observation_common_fields_view ### --

    CREATE OR REPLACE VIEW ${DB_SCHEMA}.observation_common_fields_view as (
      select activity_id,
      activity_sub_type as observation_type,
      cast(activity_payload -> 'activityTypeData' ->> 'negative_observation_ind' as bool) as negative_observation_ind,
      cast(activity_payload -> 'activityTypeData' ->> 'aquatic_observation_ind' as bool) as aquatic_observation_ind,
      cast(activity_payload -> 'activityTypeData' ->> 'primary_user_first_name' as text) as primary_user_first_name,
      cast(activity_payload -> 'activityTypeData' ->> 'primary_user_last_name' as text) as primary_user_last_name,
      cast(activity_payload -> 'activityTypeData' ->> 'secondary_user_first_name' as text) as secondary_user_first_name,
      cast(activity_payload -> 'activityTypeData' ->> 'secondary_user_last_name' as text) as secondary_user_last_name,
      cast(activity_payload -> 'activityTypeData' ->> 'species' as text) as species,
      cast(activity_payload -> 'activityTypeData' ->> 'primary_file_id' as text) as primary_file_id,
      cast(activity_payload -> 'activityTypeData' ->> 'secondary_file_id' as text) as secondary_file_id,
      cast(activity_payload -> 'activityTypeData' ->> 'location_comment' as text) as location_comment,
      cast(activity_payload -> 'activityTypeData' ->> 'general_observation_comment' as text) as general_observation_comment,
      cast(activity_payload -> 'activityTypeData' ->> 'sample_taken_ind' as bool) as sample_taken_ind,
      cast(activity_payload -> 'activityTypeData' ->> 'sample_label_number' as text) as sample_label_number

      from ${DB_SCHEMA}.activity_incoming_data
      where ${DB_SCHEMA}.activity_incoming_data.activity_type = 'Observation'
    );

    COMMENT ON VIEW ${DB_SCHEMA}.observation_common_fields_view IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    DROP VIEW IF EXISTS ${DB_SCHEMA}.observation_common_fields_view;
  `);
}
