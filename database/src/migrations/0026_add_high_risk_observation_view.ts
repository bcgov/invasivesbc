import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
  CREATE OR REPLACE VIEW invasivesbc.mussel_high_risk_observation_view AS
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
  ),
  observation_info AS (
    SELECT 
      aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information' AS obs_info,
      aid.activity_id
    FROM 
      invasivesbc.activity_incoming_data aid
  )
  SELECT
    aid.activity_id AS watercraft_risk_assessment_id,
    mowv.observer_workflow_id,
    COALESCE((oi.obs_info->'InspectionDetails'->>'dreissenidMusselsFoundPrevious')::bool, FALSE) as clean_drain_dry_after_inspection_ind,
    COALESCE((oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->>'quarantinePeriodIssued')::bool, FALSE) as quarantine_period_issued_ind,
    COALESCE((oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'standingWaterPresentLogic'->>'standingWaterPresent')::bool, FALSE) as standing_water_present_ind,
    (SELECT array_agg(cl.code_description)
    FROM jsonb_array_elements_text(oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'standingWaterPresentLogic'->'standingWaterLocation') AS arr_element 
    LEFT JOIN code_lookup cl ON arr_element = cl.code_name) as standing_water_location,
    COALESCE((oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'adultDreissenidMusselsFoundLogic'->>'adultDreissenidMusselsFound')::bool, FALSE) as adult_dreissenidae_mussel_found_ind,
    (SELECT array_agg(cl.code_description) 
    FROM jsonb_array_elements_text(oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'adultDreissenidMusselsFoundLogic'->'adultDreissenidMusselsLocation') AS arr_element 
    LEFT JOIN code_lookup cl ON arr_element = cl.code_name) as adult_dreissenidae_mussel_location,

    COALESCE((oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'decontaminationPerformedLogic'->>'decontaminationPerformed')::bool, FALSE) as decontamination_performed_ind,
    COALESCE((oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'decontaminationOrderIssuedLogic'->>'decontaminationOrderIssued')::bool, FALSE) as decontamination_order_issued_ind,
    oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'decontaminationPerformedLogic'->>'decontaminationReference' as decontamination_reference,
    COALESCE((oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'sealIssuedLogic'->'sealIssued')::bool, FALSE) as seal_issued_ind,
    oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'sealIssuedLogic'->>'sealNumber' as seal_number,
    oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->>'watercraftRegistration' as watercraft_registration,
    oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->>'otherInspectionFindings' as other_inspection_findings,
    oi.obs_info->'InspectionComments'->>'comment' as general_comments,
    (SELECT access_request_id FROM users WHERE users.idir_account_name = aid.activity_payload->>'updated_by' OR users.bceid_account_name = aid.activity_payload->>'created_by') AS created_by_user_id,
    (SELECT access_request_id FROM users WHERE users.idir_account_name = aid.activity_payload->>'updated_by' OR users.bceid_account_name = aid.activity_payload->>'updated_by') AS updated_by_user_id
  FROM
    invasivesbc.activity_incoming_data aid
  LEFT JOIN
    observation_info oi ON oi.activity_id = aid.activity_id
  LEFT JOIN
    invasivesbc.mussel_observer_workflow_view mowv ON mowv.account_name = (aid.activity_payload->>'created_by')
  WHERE
    aid.activity_subtype = 'Activity_Observation_Mussels'
    AND aid.form_status = 'Submitted'
    AND aid.iscurrent = true
    AND (
      (oi.obs_info->'BasicInformation'->'provinceAndTime'->>'inspection_time')::timestamp >= mowv.start_time::timestamp AND
      (oi.obs_info->'BasicInformation'->'provinceAndTime'->>'inspection_time')::timestamp < mowv.end_time::timestamp
      OR
      (oi.obs_info->'Passport'->>'inspection_time')::timestamp >= mowv.start_time::timestamp AND
      (oi.obs_info->'Passport'->>'inspection_time')::timestamp < mowv.end_time::timestamp
    )
  ORDER BY observer_workflow_id;
    `);
}

export async function down(knex: Knex) {
  await knex.raw(`
  DROP VIEW IF EXISTS invasivesbc.mussel_high_risk_observation_view;
  `);
}

/**
 * 	  shifts.created_by_user_id = (SELECT access_request_id from users where users.idir_account_name = aid.activity_payload->>'updated_by' OR users.bceid_account_name = aid.activity_payload->>'created_by') AND
	  (aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'BasicInformation'->'provinceAndTime'->>'inspection_time')::timestamp >= start_time::timestamp AND
	  (aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'BasicInformation'->'provinceAndTime'->>'inspection_time')::timestamp < end_time::timestamp
 */
