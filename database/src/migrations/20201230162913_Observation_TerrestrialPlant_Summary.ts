import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path=invasivesbc;
  drop view if exists invasivesbc.Activity_Observation_TerrestrialPlant cascade;
  CREATE OR REPLACE VIEW Activity_Observation_TerrestrialPlant as (
        select
        activity_id as activity_id,
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
)
    COMMENT ON VIEW Activity_Observation_TerrestrialPlant IS 'View on terrestrial plant observation specific fields, with code table values resolved';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists invasivesbc.Activity_Observation_TerrestrialPlant`);
}
