import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = invasivesbc,public;
    alter table activity_incoming_data add column row_number integer default null;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  alter table activity_incoming_data drop column row_number;
  `);
}
