import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;
    alter table application_user add column IF NOT EXISTS v2beta boolean default false; 
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  `);
}
