import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
  CREATE OR REPLACE VIEW invasivesbc.mussel_watercraft_risk_assessment_view AS
  -- Common Table Expressions
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
  -- Beginning of Column Selection
  SELECT
    aid.activity_id AS watercraft_risk_assessment_id,
    mowv.observer_workflow_id,
    (oi.obs_info->>'isPassportHolder')::boolean AS passport_holder_ind,
    CASE 
        WHEN (oi.obs_info->'InspectionDetails'->'k9Inspection'->>'k9Inspection')::boolean IS NOT NULL THEN
            (oi.obs_info->'InspectionDetails'->'k9Inspection'->>'k9Inspection')::boolean
        ELSE
            COALESCE((oi.obs_info->'Passport'->'k9Inspection'->>'k9Inspection')::boolean, FALSE)
    END AS k9Inspection_ind,
    COALESCE((oi.obs_info->'InspectionDetails'->>'aquaticPlantsFound')::boolean, FALSE) AS aquatic_plants_found_ind,
    COALESCE((oi.obs_info->'InspectionDetails'->>'marineMusselsFound')::boolean, FALSE) AS marine_mussel_found_ind,
    COALESCE((oi.obs_info->'WatercraftDetails'->'WatercraftDetails_PreviousAISKnowledge'->>'previousAISKnowledge')::boolean, FALSE) AS previous_ais_knowledge_ind,
    COALESCE((oi.obs_info->'WatercraftDetails'->'WatercraftDetails_PreviousInspection'->>'previousInspection')::boolean, FALSE) AS previous_inspection_ind,
    COALESCE((oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'adultDreissenidMusselsFoundLogic'->>'adultDreissenidMusselsFound')::boolean, FALSE) AS adult_dreissenidae_found_ind,
    CASE
      WHEN (oi.obs_info->'BasicInformation'->'provinceAndTime'->>'inspection_time')::timestamp IS NOT NULL THEN
        (oi.obs_info->'BasicInformation'->'provinceAndTime'->>'inspection_time')::timestamp
      ELSE
        (oi.obs_info->'Passport'->>'inspection_time')::timestamp
    END AS timestamp,
    COALESCE((oi.obs_info->'Passport'->>'launchedOutsideBC')::bool, FALSE) as launched_outside_bc_ind,
    CASE
      WHEN (oi.obs_info->'Passport'->'decontaminationPerformed'->>'decontaminationPerformed') IS NOT NULL THEN
        (oi.obs_info->'Passport'->'decontaminationPerformed'->>'decontaminationPerformed')::boolean
      ELSE
        COALESCE((oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'decontaminationPerformedLogic'->>'decontaminationPerformed')::boolean, FALSE)
    END AS decontamination_performed_ind,
    COALESCE((oi.obs_info->'WatercraftDetails'->'WatercraftDetails_BasicInformation'->>'commerciallyHauled')::bool, FALSE) AS commercially_hauled_ind,
    COALESCE((oi.obs_info->'InspectionDetails'->>'highRiskArea')::bool, FALSE) AS high_risk_area_ind,
    CASE 
      WHEN (oi.obs_info->'InspectionDetails'->>'highRiskArea') IS NULL THEN
        FALSE
      WHEN (oi.obs_info->'InspectionDetails'->>'highRiskArea') = 'Watercraft is Clean, Drain Dry / Adult Dreissenid Mussels NOT found' THEN
        FALSE
      ELSE
        TRUE
    END AS high_risk_aid_ind,
    oi.obs_info->'JourneyDetails'->'previousJourneyDetails'->'previousToggles'->>'previousUnknownCommercialStorageDropdown' = 'Previous Dry Storage' AS previous_dry_storage_ind,
    oi.obs_info->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->>'destinationUnknownCommercialStorageDropdown' = 'Destination Dry Storage'AS destination_dry_storage_ind,
    oi.obs_info->'JourneyDetails'->'previousJourneyDetails'->'previousToggles'->>'previousUnknownCommercialStorageDropdown' = 'Unknown Previous Waterbody' AS unknown_previous_water_body_ind,
    oi.obs_info->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->>'destinationUnknownCommercialStorageDropdown' = 'Unknown Destination Waterbody' AS unknown_destination_water_body_ind,
    oi.obs_info->'JourneyDetails'->'previousJourneyDetails'->'previousToggles'->>'previousUnknownCommercialStorageDropdown' = 'Commercial Manufacturer as Previous Water Body' AS commercial_manufacturer_as_previous_waterbody_ind,
    oi.obs_info->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->>'destinationUnknownCommercialStorageDropdown' = 'Commercial Manufacturer as Destination Water Body' AS commercial_manufacturer_as_destination_waterbody_ind,
    COALESCE((oi.obs_info->'BasicInformation'->'vehicleTypeInspectedCount'->>'non_motorized')::integer, 0) AS nonmotorized_counter,
    COALESCE((oi.obs_info->'BasicInformation'->'vehicleTypeInspectedCount'->>'simple')::integer, 0) AS simple_counter,
    COALESCE((oi.obs_info->'BasicInformation'->'vehicleTypeInspectedCount'->>'complex')::integer, 0) AS complex_counter,
    COALESCE((oi.obs_info->'BasicInformation'->'vehicleTypeInspectedCount'->>'very_complex')::integer, 0) AS very_complex_counter,
    (SELECT code_description from code_lookup where code_name = oi.obs_info->'WatercraftDetails'->'WatercraftDetails_PreviousInspection'->>'previousInspectionDays') as previous_inspection_days_count,
    oi.obs_info->'InspectionComments'->>'comment' as general_comment,
    oi.obs_info->'Passport'->>'passport_number' as passport_number,	
    CASE
      WHEN (oi.obs_info->'Passport'->'decontaminationPerformed'->>'decontaminationReference') IS NOT NULL THEN
        (oi.obs_info->'Passport'->'decontaminationPerformed'->>'decontaminationReference')
      ELSE
        (oi.obs_info->'HighRiskAssessment'->'InspectionOutcomes'->'decontaminationPerformedLogic'->>'decontaminationReference')
    END AS decontamination_reference,
    oi.obs_info->'WatercraftDetails'->'WatercraftDetails_PreviousAISKnowledge'->>'previousAISKnowledgeSource' as previous_ais_knowledge_source_code,
    oi.obs_info->'WatercraftDetails'->'WatercraftDetails_PreviousInspection'->>'previousInspectionSource' as previous_ais_inspection_source_code,
    oi.obs_info->'BasicInformation'->'provinceAndTime'->>'province' as province_code,
    COALESCE((oi.obs_info->'WatercraftDetails'->'WatercraftDetails_BasicInformation'->>'numberOfPeopleInParty')::integer, 0) as number_of_people_in_party,
    oi.obs_info->'JourneyDetails'->'previousJourneyDetails'->'previousToggles'->>'previousMajorCity' as previous_major_city,
    oi.obs_info->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->>'destinationMajorCity' as destination_major_city,
    COALESCE((oi.obs_info->>'isNewPassportIssued')::boolean, FALSE) as is_new_passport_issued,
    CASE
      WHEN (oi.obs_info->'BasicInformation'->'provinceAndTime'->>'inspection_time')::timestamp IS NOT NULL THEN
        (oi.obs_info->'BasicInformation'->'provinceAndTime'->>'inspection_time')::timestamp
      ELSE
        (oi.obs_info->'Passport'->>'inspection_time')::timestamp
      END AS inspection_time,
    COALESCE((oi.obs_info->'InspectionDetails'->>'dreissenidMusselsFoundPrevious')::boolean, FALSE) as dreissenid_mussels_found_previous,
    CASE 
        WHEN (oi.obs_info->'InspectionDetails'->'k9Inspection'->>'k9InspectionResults') IS NOT NULL THEN
            (oi.obs_info->'InspectionDetails'->'k9Inspection'->>'k9InspectionResults')
        ELSE
            (oi.obs_info->'Passport'->'k9Inspection'->>'k9InspectionResults')
    END AS k9Inspection_result,
    (SELECT access_request_id FROM users WHERE users.idir_account_name = aid.activity_payload->>'updated_by' OR users.bceid_account_name = aid.activity_payload->>'created_by') AS created_by_user_id,
    (SELECT access_request_id FROM users WHERE users.idir_account_name = aid.activity_payload->>'updated_by' OR users.bceid_account_name = aid.activity_payload->>'updated_by') AS updated_by_user_id
  -- End of Column Selection
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
  ORDER BY observer_workflow_id
  `);
}

export async function down(knex: Knex) {
  await knex.raw(`
    DROP VIEW IF EXISTS invasivesbc.mussel_watercraft_risk_assessment_view;
  `);
}
