import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;

   
   
   
   create materialized view if not exists invasivesbc.current_positive_observations_materialized as (select * from invasivesbc.current_positive_observations );
   create materialized view if not exists invasivesbc.current_negative_observations_materialized as (select * from invasivesbc.current_negative_observations ); 
  `
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  drop materialized view invasivesbc.current_positive_observations_materialized;
  drop materialized view invasivesbc.current_negative_observations_materialized;

  `);
}
