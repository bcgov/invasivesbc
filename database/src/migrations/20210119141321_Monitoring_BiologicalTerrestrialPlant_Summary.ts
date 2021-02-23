import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  knex.raw(`
set search_path=invasivesbc;
drop view if exists invasivesbc.Activity_Monitoring_Biological_TerrestrialPlant;
CREATE OR REPLACE VIEW Activity_Treatment_Mechanical_TerrestrialPlant as (

  select * from Activity_Monitoring_Biological_TerrestrialPlant_with_codes')
  )`)
}


export async function down(knex: Knex): Promise<void> {
  knex.raw(`
set search_path=invasivesbc;
drop view if exists invasivesbc.Activity_Monitoring_Biological_TerrestrialPlant;
  `)

}

