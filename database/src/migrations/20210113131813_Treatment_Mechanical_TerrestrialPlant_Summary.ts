import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path=invasivesbc;
  drop view if exists invasivesbc.Treatment_Mechanical_TerrestrialPlant ;
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
    summary.project_code
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


    COMMENT ON VIEW Treatment_Mechanical_TerrestrialPlant_Summary IS 'View on biological treatments for terrestrial plant specific fields, with code table values resolved';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists invasivesbc.Treatment_Mechanical_TerrestrialPlant_Summary cascade ;`);
}
