import * as Knex from 'knex';
//For now moving to one consolidated migration for plant reporting.

//Why:  Knex silently failing on view create, making troubleshooting which of the 10+ plant views is failing.
//      Deploying plant views then becomes a process of manually pasting the sql to the db.
//      Having one consolidated file allows for quick troubleshooting and deployments.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`


  set search_path=invasivesbc,public;
  drop VIEW if exists invasivesbc.Observation_Summary cascade;
  drop view if exists invasivesbc.Observation_AquaticPlant_Summary cascade;
  drop view if exists invasivesbc.Treatment_Biological_TerrestrialPlant_Summary cascade;
  drop  view if exists invasivesbc.Activity_Observation_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Activity_Observation_AquaticPlant_with_codes cascade;
  drop  view if exists invasivesbc.Activity_Observation_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Activity_Monitoring_Biological_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Activity_Observation_TerrestrialPlant cascade;
  drop view if exists invasivesbc.Observation_TerrestrialPlant cascade;
  drop view if exists invasivesbc.Activity_Treatment_Chemical_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Treatment_Chemical_TerrestrialPlant cascade;
  drop view if exists invasivesbc.Activity_Treatment_Biological_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Treatment_Biological_TerrestrialPlant cascade;
  drop view if exists invasivesbc.Activity_Treatment_Mechanical_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Treatment_Mechanical_TerrestrialPlant cascade;
  drop VIEW if exists Treatment_Summary cascade;

  CREATE OR REPLACE VIEW invasivesbc.Observation_Summary as (
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
    activity_payload::json->'form_data'->'activity_data'->'project_code' as project_code,

    geom,
    geog,
    media_keys,
    activity_payload::json->'form_data'->'activity_type_data'->'negative_obs_ind' as negative_observation_ind ,
    activity_payload::json->'form_data'->'activity_type_data'->'observer_last_name' as primary_user_last_name,
    activity_payload::json->'form_data'->'activity_type_data'->'observer_first_name' as primary_user_first_name,
    activity_payload::json->'form_data'->'acitivity_subtype_data'->'invasive_plant_code' as invasive_plant_code,
    activity_payload::json->'location_comment' as location_comment__NEEDS_VERIFY,
    activity_payload::json->'form_data'->'activity_data'->'general_comment' as general_observation_comment__NEEDS_VERIFY

    from invasivesbc.activity_incoming_data
    where invasivesbc.activity_incoming_data.activity_type = 'Observation'
	and deleted_timestamp is null
    );
    COMMENT ON VIEW invasivesbc.Observation_Summary IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';






  CREATE OR REPLACE VIEW Activity_Observation_TerrestrialPlant_with_codes as (
      select
      activity_id as activity_id,
      version,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_code')::text)) as invasive_plant_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_density_code')::text)) as invasive_plant_density_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_distribution_code')::text)) as invasive_plant_distribution_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'soil_texture_code')::text)) as soil_texture_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'specific_use_code')::text)) as specific_use_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'slope_code')::text)) as slope_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'aspect_code')::text)) as aspect_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'proposed_treatment_code')::text)) as proposed_treatment_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'range_unit_number')::text)) as range_unit_number,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'plant_life_stage_code')::text)) as plant_life_stage_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'plant_health_code')::text)) as plant_health_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'plant_seed_stage_code')::text)) as plant_seed_stage_code,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'flowering')::text::boolean as flowering,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'legacy_site_ind')::text::boolean as legacy_site_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'early_detection_rapid_resp_ind')::text::boolean as early_detection_rapid_resp_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'research_detection_ind')::text::boolean as research_detection_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'well_ind')::text::boolean as well_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'special_care_ind')::text::boolean as special_care_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'biological_ind')::text::boolean as biological_ind


      from activity_incoming_data
      where activity_incoming_data.activity_type = 'Observation'
      and activity_incoming_data.activity_subtype = 'Activity_Observation_PlantTerrestrial'
      and deleted_timestamp is null
      );
    COMMENT ON VIEW Activity_Observation_TerrestrialPlant_with_codes IS 'View on terrestrial plant observation specific fields, with raw code table values';



  set search_path=invasivesbc,public;
  CREATE OR REPLACE VIEW Activity_Observation_AquaticPlant_with_codes as (
      select
      activity_id as activity_id,
      version,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_code')::text)) as invasive_plant_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'specific_use_code')::text)) as specific_use_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'proposed_treatment_code')::text)) as proposed_treatment_code,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'flowering')::text::boolean as flowering,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'plant_life_stage_code')::text)) as plant_life_stage_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'plant_health_code')::text)) as plant_health_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'plant_seed_stage_code')::text)) as plant_seed_stage_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'range_unit_number')::text)) as range_unit_number,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'legacy_site_ind')::text::boolean as legacy_site_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'early_detection_rapid_resp_ind')::text::boolean as early_detection_rapid_resp_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'research_detection_ind')::text::boolean as research_detection_ind,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'sample_point_number')::text)) as sample_point_number,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'special_care_ind')::text::boolean as special_care_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'biological_ind')::text::boolean as biological_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'secchi_depth')::text::decimal as secchi_depth,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'water_depth')::text::decimal as water_depth,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'voucher_submitted_ind')::text::boolean as voucher_submitted_ind,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'voucher_submission_detail')::text)) as voucher_submission_detail

      from activity_incoming_data
      where activity_incoming_data.activity_type = 'Observation'
      and activity_incoming_data.activity_subtype = 'Activity_Observation_PlantAquatic'
      and deleted_timestamp  is null
      );
    COMMENT ON VIEW Activity_Observation_AquaticPlant_with_codes IS 'View on aquatic plant observation specific fields, with raw code table values';



  set search_path=invasivesbc,public;
  CREATE OR REPLACE VIEW Observation_AquaticPlant_Summary as (
        select
    record.activity_id,
    aid.version,
    aid.biogeoclimatic_zones,
    aid.regional_invasive_species_organization_areas,
    aid.invasive_plant_management_areas,
    aid.ownership,
    aid.regional_districts,
    aid.flnro_districts,
    aid.moti_districts,
    aid.elevation,
    aid.well_proximity,
    aid.utm_zone,
    aid.utm_northing,
    aid.utm_easting,
    aid.albers_northing,
    aid.albers_easting,

    aid.latitude,
    aid.longitude,
    aid.reported_area,
    aid.invasive_species_agency_code,
    aid.general_comment,
    aid.access_description,
    aid.jurisdictions,
    aid.project_code,
    aid.geom,
    aid.geog,
    aid.media_keys,

	      invasive_plant_codes.code_description as invasive_plant,
        record.invasive_plant_code,
        specific_use_codes.code_description as specific_use,
        record.specific_use_code,
        proposed_treatment_codes.code_description as proposed_treatment,
        record.proposed_treatment_code,
        record.flowering,
        plant_life_stage_codes.code_description as plant_life_stage,
        record.plant_life_stage_code,
        plant_health_codes.code_description as plant_health,
        record.plant_health_code,
        plant_seed_stage_codes.code_description as plant_seed_stage,
        record.plant_seed_stage_code,
        record.range_unit_number,
        record.legacy_site_ind,
        record.early_detection_rapid_resp_ind,
        record.research_detection_ind,
        record.sample_point_number,
        record.special_care_ind,
        record.biological_ind,
        record.secchi_depth,
        record.water_depth,
        record.voucher_submitted_ind,
        record.voucher_submission_detail
        from invasivesbc.Activity_Observation_AquaticPlant_with_codes record
        inner join observation_summary aid on aid.activity_id = record.activity_id

  left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' and invasive_plant_code_header.valid_to is null
  left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id
  and record.invasive_plant_code = invasive_plant_codes.code_name

  left join code_header proposed_treatment_code_header on proposed_treatment_code_header.code_header_title = 'proposed_treatment_code' and proposed_treatment_code_header.valid_to is null
  left join code proposed_treatment_codes on proposed_treatment_codes.code_header_id = proposed_treatment_code_header.code_header_id
  and record.proposed_treatment_code = proposed_treatment_codes.code_name

  left join code_header specific_use_code_header on specific_use_code_header.code_header_title = 'specific_use_code' and specific_use_code_header.valid_to is null
  left join code specific_use_codes on specific_use_codes.code_header_id = specific_use_code_header.code_header_id
  and record.specific_use_code = specific_use_codes.code_name

  left join code_header plant_life_stage_code_header on plant_life_stage_code_header.code_header_title = 'plant_life_stage_code' and plant_life_stage_code_header.valid_to is null
  left join code plant_life_stage_codes on plant_life_stage_codes.code_header_id = plant_life_stage_code_header.code_header_id
  and record.plant_life_stage_code = plant_life_stage_codes.code_name

  left join code_header plant_health_code_header on plant_health_code_header.code_header_title = 'plant_health_code' and plant_health_code_header.valid_to is null
  left join code plant_health_codes on plant_health_codes.code_header_id = plant_health_code_header.code_header_id
  and record.plant_health_code = plant_health_codes.code_name

  left join code_header plant_seed_stage_code_header on plant_seed_stage_code_header.code_header_title = 'plant_seed_stage_code' and plant_seed_stage_code_header.valid_to is null
  left join code plant_seed_stage_codes on plant_seed_stage_codes.code_header_id = plant_seed_stage_code_header.code_header_id
  and record.plant_seed_stage_code = plant_seed_stage_codes.code_name

);


  set search_path=invasivesbc,public;
  CREATE OR REPLACE VIEW Observation_TerrestrialPlant as (
        select
    record.activity_id,
    summary.version,
    summary.activity_date_time,
    summary.submitted_time,
    summary.received_timestamp,
    summary.deleted_timestamp,

    summary.biogeoclimatic_zones,
    summary.regional_invasive_species_organization_areas,
    summary.invasive_plant_management_areas,
    summary.ownership,
    summary.regional_districts,
    summary.flnro_districts,
    summary.moti_districts,
    summary.elevation,
    summary.well_proximity,
    summary.utm_zone,
    summary.utm_northing,
    summary.utm_easting,
    summary.albers_northing,
    summary.albers_easting,

    summary.latitude,
    summary.longitude,
    summary.reported_area,
    summary.invasive_species_agency_code,
    summary.general_comment,
    summary.access_description,
    summary.jurisdictions,
    summary.project_code,
    summary.geom,
    summary.geog,
    summary.media_keys,
	      invasive_plant_codes.code_description as invasive_plant,
	      record.invasive_plant_code,
		    invasive_plant_density_codes.code_description as invasive_plant_density,
		    record.invasive_plant_density_code,
		    invasive_plant_distribution_codes.code_description as invasive_plant_distribution,
		    record.invasive_plant_distribution_code,
		    soil_texture_codes.code_description as soil_texture,
		    record.soil_texture_code,
        specific_use_codes.code_description as specific_use,
        record.specific_use_code,
        slope_codes.code_description as slope,
        record.slope_code,
        aspect_codes.code_description as aspect,
        record.aspect_code,
        proposed_treatment_codes.code_description as proposed_treatment,
        record.proposed_treatment_code,
        range_unit_number,
        plant_life_stage_codes.code_description as plant_life_stage,
        record.plant_life_stage_code,
        plant_health_codes.code_description as plant_health,
        record.plant_health_code,
        plant_seed_stage_codes.code_description as plant_seed_stage,
        record.plant_seed_stage_code,
        flowering,
        legacy_site_ind,
        early_detection_rapid_resp_ind,
        research_detection_ind,
        well_ind,
        special_care_ind,
        biological_ind
        from invasivesbc.Activity_Observation_TerrestrialPlant_with_codes record


        inner join observation_summary summary on summary.activity_id = record.activity_id

left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' and invasive_plant_code_header.valid_to is null
left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id
and record.invasive_plant_code = invasive_plant_codes.code_name

left join code_header invasive_plant_density_code_header on invasive_plant_density_code_header.code_header_title = 'invasive_plant_density_code' and invasive_plant_density_code_header.valid_to is null
left join code invasive_plant_density_codes on invasive_plant_density_codes.code_header_id = invasive_plant_density_code_header.code_header_id
and record.invasive_plant_density_code = invasive_plant_density_codes.code_name

left join code_header invasive_plant_distribution_code_header on invasive_plant_distribution_code_header.code_header_title = 'invasive_plant_distribution_code' and invasive_plant_distribution_code_header.valid_to is null
left join code invasive_plant_distribution_codes on invasive_plant_distribution_codes.code_header_id = invasive_plant_distribution_code_header.code_header_id
and record.invasive_plant_distribution_code = invasive_plant_distribution_codes.code_name

left join code_header soil_texture_code_header on soil_texture_code_header.code_header_title = 'soil_texture_code' and soil_texture_code_header.valid_to is null
left join code soil_texture_codes on soil_texture_codes.code_header_id = soil_texture_code_header.code_header_id
and record.soil_texture_code = soil_texture_codes.code_name

left join code_header specific_use_code_header on specific_use_code_header.code_header_title = 'specific_use_code' and specific_use_code_header.valid_to is null
left join code specific_use_codes on specific_use_codes.code_header_id = specific_use_code_header.code_header_id
and record.specific_use_code = specific_use_codes.code_name

left join code_header slope_code_header on slope_code_header.code_header_title = 'slope_code' and slope_code_header.valid_to is null
left join code slope_codes on slope_codes.code_header_id = slope_code_header.code_header_id
and record.slope_code = slope_codes.code_name

left join code_header aspect_code_header on aspect_code_header.code_header_title = 'aspect_code' and aspect_code_header.valid_to is null
left join code aspect_codes on aspect_codes.code_header_id = aspect_code_header.code_header_id
and record.aspect_code = aspect_codes.code_name

left join code_header proposed_treatment_code_header on proposed_treatment_code_header.code_header_title = 'proposed_treatment_code' and proposed_treatment_code_header.valid_to is null
left join code proposed_treatment_codes on proposed_treatment_codes.code_header_id = proposed_treatment_code_header.code_header_id
and record.proposed_treatment_code = proposed_treatment_codes.code_name

left join code_header plant_life_stage_code_header on plant_life_stage_code_header.code_header_title = 'plant_life_stage_code' and plant_life_stage_code_header.valid_to is null
left join code plant_life_stage_codes on plant_life_stage_codes.code_header_id = plant_life_stage_code_header.code_header_id
and record.plant_life_stage_code = plant_life_stage_codes.code_name

left join code_header plant_health_code_header on plant_health_code_header.code_header_title = 'plant_health_code' and plant_health_code_header.valid_to is null
left join code plant_health_codes on plant_health_codes.code_header_id = plant_health_code_header.code_header_id
and record.plant_health_code = plant_health_codes.code_name

left join code_header plant_seed_stage_code_header on plant_seed_stage_code_header.code_header_title = 'plant_seed_stage_code' and plant_seed_stage_code_header.valid_to is null
left join code plant_seed_stage_codes on plant_seed_stage_codes.code_header_id = plant_seed_stage_code_header.code_header_id
and record.plant_seed_stage_code = aspect_codes.code_name

);
    COMMENT ON VIEW Observation_TerrestrialPlant IS 'View on terrestrial plant observation specific fields, with code table values resolved';


     set search_path=invasivesbc,public;






 
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
    activity_payload::json->'form_data'->'activity_data'->'project_code' as project_code,

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
    );
    COMMENT ON VIEW Treatment_Summary IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';







  set search_path=invasivesbc,public;
  CREATE OR REPLACE VIEW Activity_Treatment_Chemical_TerrestrialPlant_with_codes as (
      select
      activity_id,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'applicator1_first_name')::text)) as applicator1_first_name,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'applicator1_last_name')::text)) as applicator1_last_name,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'applicator1_licence_number')::text::integer as applicator1_licence_number,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'applicator2_first_name')::text)) as applicator2_first_name,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'applicator2_last_name')::text)) as applicator2_last_name,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'applicator2_licence_number')::text::decimal as applicator2_licence_number,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'pesticide_employer_code')::text)) as pesticide_employer_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'pesticide_use_permit_PUP')::text)) as pesticide_use_permit_PUP,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'pest_management_plan')::text)) as pest_management_plan,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'treatment_issues_code')::text)) as treatment_issues_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'chemical_method_code')::text)) as chemical_method_code,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'temperature')::text::integer as temperature,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'wind_speed')::text::integer as wind_speed,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'wind_direction_code')::text)) as wind_direction_code,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'humidity')::text::integer as humidity
      -- need to work with Shasko on these:
      --invasive_plants
      --herbicide

      from activity_incoming_data
      where activity_incoming_data.activity_type = 'Treatment'
      and activity_incoming_data.activity_subtype = 'Activity_Treatment_ChemicalPlant'
      and deleted_timestamp is null
      );
    COMMENT ON VIEW Activity_Treatment_Chemical_TerrestrialPlant_with_codes IS 'View on terrestrial plant chemical treatments specific fields, with raw code table values';


    set search_path=invasivesbc,public;
  CREATE OR REPLACE VIEW Treatment_Chemical_TerrestrialPlant as (
        select
    record.activity_id,
    summary.version,
    summary.activity_date_time,
    summary.submitted_time,
    summary.received_timestamp,
    summary.deleted_timestamp,

    summary.biogeoclimatic_zones,
    summary.regional_invasive_species_organization_areas,
    summary.invasive_plant_management_areas,
    summary.ownership,
    summary.regional_districts,
    summary.flnro_districts,
    summary.moti_districts,
    summary.elevation,
    summary.well_proximity,
    summary.utm_zone,
    summary.utm_northing,
    summary.utm_easting,
    summary.albers_northing,
    summary.albers_easting,

    summary.latitude,
    summary.longitude,
    summary.reported_area,
    summary.invasive_species_agency_code,
    summary.general_comment,
    summary.access_description,
    summary.jurisdictions,
    summary.project_code,
    summary.geom,
    summary.geog,
    summary.media_keys,
        record.applicator1_first_name,
        record.applicator1_last_name,
        record.applicator1_licence_number,
        record.applicator2_first_name,
        record.applicator2_last_name,
        record.applicator2_licence_number,
        record.pesticide_employer_code,
        pesticide_employer_codes.code_description as pesticide_employer,
        record.pesticide_use_permit_PUP,
        record.pest_management_plan,
        record.treatment_issues_code,
        treatment_issues_codes.code_description as treatment_issues,
        record.chemical_method_code,
        chemical_method_codes.code_description as chemical_method,
        record.temperature,
        record.wind_speed,
        record.wind_direction_code,
        wind_direction_codes.code_description as wind_direction,
        record.humidity

        from invasivesbc.Activity_Treatment_Chemical_TerrestrialPlant_with_codes record

        join treatment_summary summary on summary.activity_id = record.activity_id

left join code_header treatment_issues_code_header on treatment_issues_code_header.code_header_title = 'treatment_issues_code' and treatment_issues_code_header.valid_to is null
left join code treatment_issues_codes on treatment_issues_codes.code_header_id = treatment_issues_code_header.code_header_id
and record.treatment_issues_code = treatment_issues_codes.code_name

left join code_header pesticide_employer_code_header on pesticide_employer_code_header.code_header_title = 'pesticide_employer_code' and pesticide_employer_code_header.valid_to is null
left join code pesticide_employer_codes on pesticide_employer_codes.code_header_id = pesticide_employer_code_header.code_header_id
and record.pesticide_employer_code = pesticide_employer_codes.code_name

left join code_header chemical_method_code_header on chemical_method_code_header.code_header_title = 'chemical_method_code' and chemical_method_code_header.valid_to is null
left join code chemical_method_codes on chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id
and record.chemical_method_code = chemical_method_codes.code_name

left join code_header wind_direction_code_header on wind_direction_code_header.code_header_title = 'wind_direction_code' and wind_direction_code_header.valid_to is null
left join code wind_direction_codes on wind_direction_codes.code_header_id = wind_direction_code_header.code_header_id
and record.wind_direction_code = wind_direction_codes.code_name
);


    COMMENT ON VIEW Treatment_Chemical_TerrestrialPlant IS 'View on chemical treatments for terrestrial plant specific fields, with code table values resolved';






set search_path=invasivesbc,public;
CREATE OR REPLACE VIEW Activity_Treatment_Biological_TerrestrialPlant_with_codes as (
    select
    activity_id,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_code')::text)) as invasive_plant_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'classified_area_code')::text)) as classified_area_code,
    (activity_payload::json->'form_data'->'activity_subtype_data'->'applicator1_licence_number')::text::integer as applicator1_licence_number,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'agent_source')::text)) as agent_source,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'biological_agent_code')::text)) as biological_agent_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'biological_agent_stage_code')::text)) as biological_agent_stage_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'bioagent_maturity_status_code')::text)) as bioagent_maturity_status_code

    from activity_incoming_data
    where activity_incoming_data.activity_type = 'Treatment'
    and activity_incoming_data.activity_subtype = 'Treatment_BiologicalPlant'
    and deleted_timestamp is null
    );
    COMMENT ON VIEW Activity_Treatment_Biological_TerrestrialPlant_with_codes IS 'View on terrestrial plant biological treatments specific fields, with raw code table values';



     set search_path=invasivesbc,public;
  CREATE OR REPLACE VIEW Treatment_Biological_TerrestrialPlant as (
        select
    record.activity_id,
    summary.version,
    summary.activity_date_time,
    summary.submitted_time,
    summary.received_timestamp,
    summary.deleted_timestamp,

    summary.biogeoclimatic_zones,
    summary.regional_invasive_species_organization_areas,
    summary.invasive_plant_management_areas,
    summary.ownership,
    summary.regional_districts,
    summary.flnro_districts,
    summary.moti_districts,
    summary.elevation,
    summary.well_proximity,
    summary.utm_zone,
    summary.utm_northing,
    summary.utm_easting,
    summary.albers_northing,
    summary.albers_easting,

    summary.latitude,
    summary.longitude,
    summary.reported_area,
    summary.invasive_species_agency_code,
    summary.general_comment,
    summary.access_description,
    summary.jurisdictions,
    summary.project_code,
    summary.geom,
    summary.geog,
    summary.media_keys,
        record.invasive_plant_code,
        invasive_plant_codes.code_description as invasive_plant,
        record.classified_area_code,
        classified_area_codes.code_description as classified_area,
        record.applicator1_licence_number,
        record.agent_source,
        biological_agent_codes.code_description as biological_agent,
        record.biological_agent_stage_code,
        record.bioagent_maturity_status_code,
        bioagent_maturity_status_codes.code_description as bioagent_maturity_status

        from invasivesbc.Activity_Treatment_Biological_TerrestrialPlant_with_codes record

        join treatment_summary summary on summary.activity_id = record.activity_id
left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' and invasive_plant_code_header.valid_to is null
left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id
and record.invasive_plant_code = invasive_plant_codes.code_name

left join code_header classified_area_code_header on classified_area_code_header.code_header_title = 'classified_area_code' and classified_area_code_header.valid_to is null
left join code classified_area_codes on classified_area_codes.code_header_id = classified_area_code_header.code_header_id
and record.classified_area_code = classified_area_codes.code_name

left join code_header biological_agent_code_header on biological_agent_code_header.code_header_title = 'biological_agent_code' and biological_agent_code_header.valid_to is null
left join code biological_agent_codes on biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id
and record.biological_agent_code = biological_agent_codes.code_name

left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' and biological_agent_stage_code_header.valid_to is null
left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id
and record.biological_agent_stage_code = biological_agent_stage_codes.code_name

left join code_header bioagent_maturity_status_code_header on bioagent_maturity_status_code_header.code_header_title = 'bioagent_maturity_status_code' and bioagent_maturity_status_code_header.valid_to is null
left join code bioagent_maturity_status_codes on bioagent_maturity_status_codes.code_header_id = bioagent_maturity_status_code_header.code_header_id
and record.bioagent_maturity_status_code = bioagent_maturity_status_codes.code_name

);


    COMMENT ON VIEW Treatment_Biological_TerrestrialPlant IS 'View on biological treatments for terrestrial plant specific fields, with code table values resolved';




set search_path=invasivesbc,public;
CREATE OR REPLACE VIEW Activity_Treatment_Mechanical_TerrestrialPlant_with_codes as (
    select
    activity_id,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_code')::text)) as invasive_plant_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'mechanical_method_code')::text)) as mechanical_method_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'mechanical_disposal_code')::text)) as mechanical_disposal_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'root_removal_code')::text)) as root_removal_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'soil_disturbance_code')::text)) as soil_disturbance_code,
    (activity_payload::json->'form_data'->'activity_subtype_data'->'signage_on_site')::text::boolean as signage_on_site

    from activity_incoming_data
    where activity_incoming_data.activity_type = 'Treatment'
    and activity_incoming_data.activity_subtype = 'Treatment_MechanicalPlant'
    and deleted_timestamp is null
    );
    COMMENT ON VIEW Activity_Treatment_Mechanical_TerrestrialPlant_with_codes IS 'View on terrestrial plant mechanical treatments specific fields, with raw code table values';


    set search_path=invasivesbc,public;
  CREATE OR REPLACE VIEW Treatment_Mechanical_TerrestrialPlant as (
        select
    record.activity_id,
    summary.version,
    summary.activity_date_time,
    summary.submitted_time,
    summary.received_timestamp,
    summary.deleted_timestamp,

    summary.biogeoclimatic_zones,
    summary.regional_invasive_species_organization_areas,
    summary.invasive_plant_management_areas,
    summary.ownership,
    summary.regional_districts,
    summary.flnro_districts,
    summary.moti_districts,
    summary.elevation,
    summary.well_proximity,
    summary.utm_zone,
    summary.utm_northing,
    summary.utm_easting,
    summary.albers_northing,
    summary.albers_easting,

    summary.latitude,
    summary.longitude,
    summary.reported_area,
    summary.invasive_species_agency_code,
    summary.general_comment,
    summary.access_description,
    summary.jurisdictions,
    summary.project_code,
    summary.geom,
    summary.geog,
    summary.media_keys,
        record.invasive_plant_code,
        invasive_plant_codes.code_description as invasive_plant,
        record.mechanical_method_code,
        mechanical_method_codes.code_description as mechanical_method,
        record.mechanical_disposal_code,
        mechanical_disposal_codes.code_description as mechanical_disposal,
        record.root_removal_code,
        root_removal_codes.code_description as root_removal,
        record.soil_disturbance_code,
        soil_disturbance_codes.code_description as soil_disturbance,
        record.signage_on_site

        from invasivesbc.Activity_Treatment_Mechanical_TerrestrialPlant_with_codes record

        join treatment_summary summary on summary.activity_id = record.activity_id
left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' and invasive_plant_code_header.valid_to is null
left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id
and record.invasive_plant_code = invasive_plant_codes.code_name

left join code_header mechanical_method_code_header on mechanical_method_code_header.code_header_title = 'mechanical_method_code' and mechanical_method_code_header.valid_to is null
left join code mechanical_method_codes on mechanical_method_codes.code_header_id = mechanical_method_code_header.code_header_id
and record.mechanical_method_code = mechanical_method_codes.code_name

left join code_header mechanical_disposal_code_header on mechanical_disposal_code_header.code_header_title = 'mechanical_disposal_code' and mechanical_disposal_code_header.valid_to is null
left join code mechanical_disposal_codes on mechanical_disposal_codes.code_header_id = mechanical_disposal_code_header.code_header_id
and record.mechanical_disposal_code = mechanical_disposal_codes.code_name

left join code_header root_removal_code_header on root_removal_code_header.code_header_title = 'root_removal_code' and root_removal_code_header.valid_to is null
left join code root_removal_codes on root_removal_codes.code_header_id = root_removal_code_header.code_header_id
and record.root_removal_code = root_removal_codes.code_name

left join code_header soil_disturbance_code_header on soil_disturbance_code_header.code_header_title = 'soil_disturbance_code' and soil_disturbance_code_header.valid_to is null
left join code soil_disturbance_codes on soil_disturbance_codes.code_header_id = soil_disturbance_code_header.code_header_id
and record.soil_disturbance_code = soil_disturbance_codes.code_name

);


    COMMENT ON VIEW Treatment_Mechanical_TerrestrialPlant IS 'View on biological treatments for terrestrial plant specific fields, with code table values resolved';




  set search_path=invasivesbc,public;
  drop VIEW if exists Monitoring_Summary cascade;
  CREATE OR REPLACE VIEW Monitoring_Summary as (
    select
    activity_id,
    activity_subtype as monitoring_type,
    activity_payload::json->'form_data'->'acitivity_subtype_data'->'efficacy_code' as efficacy_code,


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
    activity_payload::json->'form_data'->'activity_data'->'project_code' as project_code,

    geom,
    geog,
    media_keys,
    activity_payload::json->'form_data'->'activity_type_data'->'observer_last_name' as primary_user_last_name,
    activity_payload::json->'form_data'->'activity_type_data'->'observer_first_name' as primary_user_first_name,
    activity_payload::json->'form_data'->'acitivity_subtype_data'->'invasive_plant_code' as invasive_plant_code,
    activity_payload::json->'form_data'->'activity_data'->'general_comment' as general_observation_comment__NEEDS_VERIFY

    from activity_incoming_data
    where activity_incoming_data.activity_type = 'Monitoring'
	and deleted_timestamp is null
    );
    COMMENT ON VIEW Monitoring_Summary IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';



set search_path=invasivesbc,public;
CREATE OR REPLACE VIEW Activity_Monitoring_Biological_TerrestrialPlant_with_codes as (
    select
    activity_id,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_code')::text)) as invasive_plant_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'mechanical_method_code')::text)) as mechanical_method_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'mechanical_disposal_code')::text)) as mechanical_disposal_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'root_removal_code')::text)) as root_removal_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'soil_disturbance_code')::text)) as soil_disturbance_code,
    (activity_payload::json->'form_data'->'activity_subtype_data'->'signage_on_site')::text::boolean as signage_on_site

    from activity_incoming_data
    where activity_incoming_data.activity_type = 'Monitoring'
    and activity_incoming_data.activity_subtype = 'Monitoring_BiologicalTerrestrialPlant'
    and deleted_timestamp is null
    );
    COMMENT ON VIEW Activity_Monitoring_Biological_TerrestrialPlant_with_codes IS 'View on terrestrial plant mechanical treatments specific fields, with raw code table values';



  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`  set search_path=invasivesbc,public;
  drop VIEW if exists invasivesbc.Observation_Summary cascade;
  drop  view if exists invasivesbc.Activity_Observation_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Activity_Observation_AquaticPlant_with_codes cascade;
  drop  view if exists invasivesbc.Activity_Observation_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Activity_Monitoring_Biological_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Observation_AquaticPlant_Summary cascade;
  drop view if exists invasivesbc.Activity_Observation_TerrestrialPlant cascade;
  drop view if exists invasivesbc.Observation_TerrestrialPlant cascade;
  drop view if exists invasivesbc.Activity_Treatment_Chemical_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Treatment_Chemical_TerrestrialPlant cascade;
  drop view if exists invasivesbc.Activity_Treatment_Biological_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Treatment_Biological_TerrestrialPlant_Summary cascade;
  drop view if exists invasivesbc.Treatment_Biological_TerrestrialPlant cascade;
  drop view if exists invasivesbc.Activity_Treatment_Mechanical_TerrestrialPlant_with_codes cascade;
  drop view if exists invasivesbc.Treatment_Mechanical_TerrestrialPlant cascade;
  drop VIEW if exists Treatment_Summary cascade;`);
}
