import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  drop view if exists monitoring_summary cascade
  CREATE OR REPLACE VIEW Monitoring_Summary as (
    select
    id as activity_id,
    activity_sub_type as monitoring_type,
    activity_payload::json->'form_data'->'activity_type_data'->'observer_last_name' as primary_user_last_name,
    activity_payload::json->'form_data'->'activity_type_data'->'observer_first_name' as primary_user_first_name,
    activity_payload::json->'form_data'->'acitivity_subtype_data'->'efficacy_code' as efficacy_code

    from activity_incoming_data
    where activity_incoming_data.activity_type = 'Monitoring'
    )
    COMMENT ON VIEW Monitoring_Summary IS 'View on fields common to all types of monitorings, with table activity_incoming_data as source.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists monitoring_summary cascade`);
}
