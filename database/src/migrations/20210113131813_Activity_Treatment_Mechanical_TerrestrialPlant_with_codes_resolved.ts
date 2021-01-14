import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path=invasivesbc;
  drop view if exists invasivesbc.Activity_Treatment_Mechanical_TerrestrialPlant ;
  CREATE OR REPLACE VIEW Activity_Treatment_Mechanical_TerrestrialPlant as (
        select
        record.activity_id,
        record.invasive_plant_code,
        invasive_plant_codes.description,
        record.mechanical_method_code,
        mechanical_method_codes.description,
        record.mechanical_disposal_code,
        mechanical_disposal_codes.description,
        record.root_removal_code,
        root_removal_codes.description,
        record.soil_disturbance_code,
        soil_disturbance_codes.description,
        record.signage_on_site

        from invasivesbc.Activity_Treatment_Mechanical_TerrestrialPlant_with_codes record

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

)


    COMMENT ON VIEW Activity_Treatment_Chemical_MechanicalPlant IS 'View on biological treatments for terrestrial plant specific fields, with code table values resolved';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists invasivesbc.Activity_Treatment_Mechanical_TerrestrialPlant ;`);
}
