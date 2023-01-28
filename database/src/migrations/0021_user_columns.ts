import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
  set search_path=invasivesbc,public;

  alter table activity_incoming_data
  add column created_by_with_guid text, 
  add column updated_by_with_guid text ;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    `);
}
