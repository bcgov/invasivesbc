import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema 'public';
    set search_path = invasivesbc,public;
    alter table if exists access_request
    add column if not exists requested_roles varchar(1000) null;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table if exists access_request
    drop column if exists requested_roles;
  `);
}
