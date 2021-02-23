import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path=invasivesbc;
  drop VIEW if exists Treatment_Summary cascade;
  CREATE OR REPLACE VIEW Treatment_Summary as (
    select
    activity_id,
    activity_subtype as observation_type,

    version,
    activity_payload::json->'form_data'->'activity_data'->'activity_date_time' as activity_date_time,
    created_timestamp as submitted_time,
    received_timestamp,
    deleted_timestamp,

    biogeoclimatic_zones,
    regional_invasive_species_organization_areas,
    invasive_plant_management_areas,
    ownership,
    regional_districts,
    flnro_districts,
    moti_districts,
    elevation,
    well_proximity,
    utm_zone,
    utm_northing,
    utm_easting,
    albers_northing,
    albers_easting,

    activity_payload::json->'form_data'->'activity_data'->'latitude' as latitude,
    activity_payload::json->'form_data'->'activity_data'->'longitude' as longitude,
    activity_payload::json->'form_data'->'activity_data'->'reported_area' as reported_area,
    activity_payload::json->'form_data'->'activity_data'->'invasive_species_agency_code' as invasive_species_agency_code,
    activity_payload::json->'form_data'->'activity_data'->'general_comment' as general_comment,
    activity_payload::json->'form_data'->'activity_data'->'access_description' as access_description,
    activity_payload::json->'form_data'->'activity_data'->'jurisdictions' as jurisdictions,
    activity_payload::json->'form_data'->'activity_data'->'project_code' as project_code

    geom,
    geog,
    media_keys,
    activity_payload::json->'form_data'->'activity_type_data'->'observer_last_name' as primary_user_last_name,
    activity_payload::json->'form_data'->'activity_type_data'->'observer_first_name' as primary_user_first_name,
    activity_payload::json->'form_data'->'acitivity_subtype_data'->'invasive_plant_code' as invasive_plant_code,
    activity_payload::json->'form_data'->'activity_data'->'general_comment' as general_observation_comment__NEEDS_VERIFY

    from activity_incoming_data
    where activity_incoming_data.activity_type = 'Treatment'
	and deleted_timestamp is null
    )
    COMMENT ON VIEW Treatment_Summary IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists Treatment_Summary cascade`);
}
