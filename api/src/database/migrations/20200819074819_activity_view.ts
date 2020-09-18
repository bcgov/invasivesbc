import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    -- ### Creating View: activity_common_fields_view ### --

    CREATE OR REPLACE VIEW ${DB_SCHEMA}.activity_common_fields_view as (
      select
      activity_id,
      activity_type,
      activity_sub_type,
      cast(activity_payload -> 'locationAndGeometry' ->> 'anchorPointX' as decimal) as anchor_point_x,
      cast(activity_payload -> 'locationAndGeometry' ->> 'anchorPointY' as decimal) as anchor_point_y,
      received_timestamp

      from ${DB_SCHEMA}.activity_incoming_data
    );

    COMMENT ON VIEW ${DB_SCHEMA}.activity_common_fields_view IS 'View on fields common to all types of activities, with table activity_incoming_data as source.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    DROP VIEW IF EXISTS activity_common_fields_view;
  `);
}
