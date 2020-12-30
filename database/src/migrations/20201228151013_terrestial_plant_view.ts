import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`

set search_path=invasivesbc;
drop view if exists invasivesbc.terrestrial_plant_observation_view ;
CREATE OR REPLACE VIEW terrestrial_plant_observation_view as (
    select
    activity_id as activity_id,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_code')::text)) as invasive_plant_code,
    (activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_density_code')::text as invasive_plant_density_code
  --  (activity_payload::json->'form_data'->'activity_subtype_data'->'well_ind')::text::boolean as well_ind,
   -- (activity_payload::json->'form_data'->'activity_subtype_data'->'flowering')::text:boolean as flowing,
   -- (activity_payload::json->'form_data'->'activity_subtype_data'->'slope_code')::text as slope_code,
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'aspect_code',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'biological_ind',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'legacy_site_ind',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'special_care_ind',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'plant_health_code',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'soil_texture_code',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'specific_use_code',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_code',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'plant_life_stage_code',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'plant_seed_stage_code',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'treatment_issues_code',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'research_detection_ind',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'proposed_treatment_code',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'pesticide_use_permit_PUP',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'early_detection_rapid_resp_ind',
    -- activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_distribution_code',


    from activity_incoming_data
    --where activity_incoming_data.activity_type = 'Observation'
   -- and activity_incoming_data.activity_subtype = 'Observation_PlantTerrestial'
    )
    COMMENT ON VIEW terrestrial_plant_observation_view IS 'View on terrestrial plant observation specific fields';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists terrestrial_plant_observation_view`);
}
