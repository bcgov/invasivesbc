import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
  CREATE OR REPLACE VIEW invasivesbc.mussel_observer_workflow_view AS
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
  (aid.activity_payload->'form_data'->'activity_subtype_data'->'shiftInformation'->'shiftStart'->>'shiftStartTime')::date as date,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'shiftInformation'->'shiftStart'->>'shiftStartTime' AS start_time,
  (aid.activity_payload->'form_data'->'activity_subtype_data'->'shiftInformation'->'shiftStart'->>'shiftStartTime')::date + (aid.activity_payload->'form_data'->'activity_subtype_data'->'shiftInformation'->'shiftEnd'->>'shiftEndTime')::time AS end_time,
  (SELECT code_description FROM code_lookup WHERE code_name = aid.activity_payload->'form_data'->'activity_subtype_data'->'shiftInformation'->'shiftStart'->>'station') AS station,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'shiftInformation'->'shiftStart'->>'shiftStartComments' AS shift_start_comment,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'shiftInformation'->'shiftEnd'->>'shiftEndComments' AS shift_end_comment,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'shiftInformation'->'shiftEnd'->>'boatsInspected' AS boats_inspected_ind,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'shiftInformation'->'shiftEnd'->>'k9OnShift' AS k9_on_shift_ind,
  aid.activity_payload->>'created_timestamp' AS created_at,
  aid.activity_payload->>'date_updated' AS updated_at,
  (SELECT access_request_id from users where users.idir_account_name = aid.activity_payload->>'updated_by' OR users.bceid_account_name = aid.activity_payload->>'updated_by') AS updated_by_user_id,
  (SELECT access_request_id from users where users.idir_account_name = aid.activity_payload->>'updated_by' OR users.bceid_account_name = aid.activity_payload->>'updated_by') AS created_by_user_id,
  aid.activity_payload->>'created_by' AS account_name
FROM
  invasivesbc.activity_incoming_data aid
WHERE
  aid.activity_subtype = 'Activity_Officer_Shift' AND
  aid.form_status = 'Submitted' AND
  (aid.activity_payload->'form_data'->'activity_subtype_data'->'shiftInformation'->'shiftStart'->>'shiftStartTime')::date IS NOT  NULL
ORDER BY start_time ASC;
    `);
}

export async function down(knex: Knex) {
  await knex.raw(`
  DROP VIEW IF EXISTS invasivesbc.mussel_observer_workflow_view;
  `);
}

/**
 * 	  shifts.created_by_user_id = (SELECT access_request_id from users where users.idir_account_name = aid.activity_payload->>'updated_by' OR users.bceid_account_name = aid.activity_payload->>'created_by') AND
	  (aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'BasicInformation'->'provinceAndTime'->>'inspection_time')::timestamp >= start_time::timestamp AND
	  (aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'BasicInformation'->'provinceAndTime'->>'inspection_time')::timestamp < end_time::timestamp
 */
