import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema 'public';
    set search_path = invasivesbc,public;
    alter table if exists access_request
    add column if not exists requested_roles varchar(1000) null;
    
    alter table if exists access_request
    add column idir_userid varchar(100) null;

    alter table if exists access_request
    add column bceid_userid varchar(100) null;

    alter table if exists application_user
    add column if not exists idir_userid varchar(100) null;

    alter table if exists application_user
    add column if not exists bceid_userid varchar(100) null;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table if exists access_request
    drop column if exists requested_roles;

    alter table if exists access_request
    drop column if exists idir_userid;

    alter table if exists access_request
    drop column if exists bceid_userid;

    alter table if exists application_user
    drop column if exists idir_userid;

    alter table if exists application_user
    drop column if exists bceid_userid;
  `);
}
