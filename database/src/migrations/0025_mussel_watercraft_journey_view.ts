import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
  CREATE OR REPLACE VIEW invasivesbc.mussel_watercraft_journey_view AS
  WITH code_lookup AS (
    SELECT
        code_name,
        code_description
    FROM
        invasivesbc.code
  )
  SELECT
    aid.activity_payload->>'_id' as watercraft_risk_assessment_id,
    (SELECT code_description FROM code_lookup WHERE code_name = pwb->>'numberOfDaysOut') as number_of_days_out,
    pwb->>'previousWaterbody' AS previous_water_body_id,
	  aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->'destinationWaterBody'->>'destinationWaterbody' AS destination_water_body_id,
	
    (
      COALESCE(pwb->>'manualWaterbodyName' || ', ', '') ||
      COALESCE(pwb->>'manualWaterbodyCity' || ', ', '') ||
      COALESCE(pwb->>'manualWaterbodyCountry', '')
    ) AS other_previous_water_body_detail,
    (
        COALESCE(aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->'destinationWaterBody'->>'manualWaterbodyName' || ', ', '') ||
        COALESCE(aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->'destinationWaterBody'->>'manualWaterbodyCity' || ', ', '') ||
        COALESCE(aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->'destinationWaterBody'->>'manualWaterbodyCountry', '')
    ) AS other_destination_water_body_detail,
    aid.activity_payload->>'created_timestamp' AS created_at,
    aid.activity_payload->>'date_updated' AS updated_at,
    aid.activity_payload->>'updated_by_with_guid' AS updated_by_user_id,
    aid.activity_payload->>'created_by_with_guid' AS created_by_user_id,
    aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->'destinationWaterBody'->>'manualWaterbodyName'    AS other_destination_water_body_detail_name,
    aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->'destinationWaterBody'->>'manualWaterbodyCity'    AS other_destination_water_body_detail_city,
    aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->'destinationWaterBody'->>'manualWaterbodyCountry' AS other_destination_water_body_detail_country,
    pwb->>'manualWaterbodyCity' AS other_previous_water_body_detail_city,
    pwb->>'manualWaterbodyCountry' AS other_previous_waterbody_detail_country,
	  pwb->>'manualWaterbodyName' AS other_previous_water_body_detail_name
  FROM
    invasivesbc.activity_incoming_data aid,
	  jsonb_array_elements(aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'JourneyDetails'->'previousJourneyDetails'->'previousToggles'->'previousWaterBody') as pwb
  WHERE
    (
      pwb->>'manualWaterbodyName' IS NOT NULL OR
      pwb->>'previousWaterbody' IS NOT NULL OR
      aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->'destinationWaterBody'->>'manualWaterbodyName' IS NOT NULL OR
      aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_Mussels_Information'->'JourneyDetails'->'destinationJourneyDetails'->'destinationToggles'->'destinationWaterBody'->>'destinationWaterbody' IS NOT NULL	  
    ) AND
    aid.activity_subtype = 'Activity_Observation_Mussels' AND
    aid.iscurrent = true AND
    aid.form_status = 'Submitted';
  `);
}

export async function down(knex: Knex) {
  await knex.raw(`
  DROP VIEW IF EXISTS invasivesbc.mussel_watercraft_journey_view;
  `);
}
