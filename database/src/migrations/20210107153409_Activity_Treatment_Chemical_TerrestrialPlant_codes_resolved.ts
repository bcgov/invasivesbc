import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path=invasivesbc;
  drop view if exists invasivesbc.Treatment_Chemical_TerrestrialPlant_Summary ;
  CREATE OR REPLACE VIEW Treatment_Chemical_TerrestrialPlant_Summary as (
        select
        record.activity_id,
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

--technically this should be used in all the subsequent joins, but we can get away without for now:
--join code_category on inv_code_category on inv_code_category.code_category_name = 'invasives'


left join code_header pesticide_employer_code_header on pesticide_employer_code_header.code_header_title = 'pesticide_employer_code' and pesticide_employer_code_header.valid_to is null
left join code pesticide_employer_codes on pesticide_employer_codes.code_header_id = pesticide_employer_code_header.code_header_id
and record.pesticide_employer_code = pesticide_employer_codes.code_name

left join code_header treatment_issues_code_header on treatment_issues_code_header.code_header_title = 'treatment_issues_code' and treatment_issues_code_header.valid_to is null
left join code treatment_issues_codes on treatment_issues_codes.code_header_id = treatment_issues_code_header.code_header_id
and record.treatment_issues_code = treatment_issues_codes.code_name

left join code_header chemical_method_code_header on chemical_method_code_header.code_header_title = 'chemical_method_code' and chemical_method_code_header.valid_to is null
left join code chemical_method_codes on chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id
and record.chemical_method_code = chemical_method_codes.code_name

left join code_header wind_direction_code_header on wind_direction_code_header.code_header_title = 'wind_direction_code' and wind_direction_code_header.valid_to is null
left join code wind_direction_codes on wind_direction_codes.code_header_id = wind_direction_code_header.code_header_id
and record.wind_direction_code = wind_direction_codes.code_name
)


    COMMENT ON VIEW Activity_Treatment_Chemical_TerrestrialPlant IS 'View on chemical treatments for terrestrial plant specific fields, with code table values resolved';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists invasivesbc.Activity_Treatment_Chemical_TerrestrialPlant_Summary ;`);
}
