import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
  CREATE OR REPLACE VIEW invasivesbc.mussel_blow_by_view AS
  WITH code_lookup AS (
    SELECT
        code_name,
        code_description
    FROM
        invasivesbc.code
  ),
  users AS (
    SELECT
      access_request_id,
      idir_account_name,
      bceid_account_name
    FROM
      invasivesbc.access_request
  )
  SELECT
    aid.activity_id as observer_workflow_id,
    (aid.activity_payload->'form_data'->'activity_subtype_data'->'shiftInformation'->'shiftStart'->>'shiftStartTime')::date + (blow_by->>'blowbyTime')::time as blow_by_time,
    (blow_by->>'reportedToRapp')::boolean as reported_to_rapp,
    (SELECT code_description FROM code_lookup WHERE code_name = blow_by->>'watercraftComplexity') as watercraft_complexity,
    (aid.activity_payload->>'created_timestamp')::timestamp AS created_at,
    aid.activity_payload->>'date_updated' AS updated_at,
    (SELECT access_request_id from users where users.idir_account_name = aid.activity_payload->>'updated_by' OR users.bceid_account_name = aid.activity_payload->>'created_by') AS created_by_user_id,
    (SELECT access_request_id from users where users.idir_account_name = aid.activity_payload->>'updated_by' OR users.bceid_account_name = aid.activity_payload->>'updated_by') AS updated_by_user_id
  FROM
    invasivesbc.activity_incoming_data aid,
    jsonb_array_elements(aid.activity_payload->'form_data'->'activity_subtype_data'->'Blowbys') AS blow_by
  WHERE
    aid.activity_subtype = 'Activity_Officer_Shift' AND
    aid.form_status = 'Submitted' AND
    aid.iscurrent = true
  ORDER BY created_at ASC;
  `);
}

export async function down(knex: Knex) {
  await knex.raw(`
    DROP VIEW IF EXISTS invasivesbc.mussel_blow_by_view;
  `);
}
