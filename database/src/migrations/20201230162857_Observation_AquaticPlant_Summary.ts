import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path=invasivesbc;
  drop view if exists invasivesbc.Observation_AquaticPlant_Summary cascade;
  CREATE OR REPLACE VIEW Observation_AquaticPlant_Summary as (
        select
    record.activity_id,
    record.version,
    record.activity_date_time,
    record.submitted_time,
    record.received_timestamp,
    record.deleted_timestamp,

    record.biogeoclimatic_zones,
    record.regional_invasive_species_organization_areas,
    record.invasive_plant_management_areas,
    record.ownership,
    record.regional_districts,
    record.flnro_districts,
    record.moti_districts,
    record.elevation,
    record.well_proximity,
    record.utm_zone,
    record.utm_northing,
    record.utm_easting,
    record.albers_northing,
    record.albers_easting,

    record.latitude,
    record.longitude,
    record.reported_area,
    record.invasive_species_agency_code,
    record.general_comment,
    record.access_description,
    record.jurisdictions,
    record.project_code,
    record.geom,
    record.geog,
    record.media_keys,

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

where record.deleted_timestamp is null
  )    `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`

  set search_path=invasivesbc;
  drop view if exists invasivesbc.Observation_AquaticPlant_Summary; `);
}
