import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema 'public';
    set search_path = invasivesbc,public;
    
    alter table if exists access_request
      add column if not exists requested_roles varchar(1000) null,
      add column if not exists idir_userid varchar(100) null,
      add column if not exists bceid_userid varchar(100) null;

    alter table if exists application_user
      add column if not exists idir_userid varchar(100) null,
      add column if not exists bceid_userid varchar(100) null,
      add column if not exists idir_account_name varchar(100) null,
      add column if not exists bceid_account_name varchar(100) null,
      add column if not exists work_phone_number varchar(100) null,
      add column if not exists funding_agencies varchar(1000) null,
      add column if not exists employer varchar(100) null,
      add column if not exists pac_number varchar(100) null,
      add column if not exists pac_service_number_1 varchar(100) null,
      add column if not exists pac_service_number_2 varchar(100) null;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table if exists access_request
      drop column if exists requested_roles;
      drop column if exists bceid_userid;
      drop column if exists idir_userid;

    alter table if exists application_user
      drop column if exists idir_userid;
      drop column if exists bceid_userid;
      drop column if exists idir_account_name,
      drop column if exists bceid_account_name,
      drop column if exists work_phone_number,
      drop column if exists funding_agencies,
      drop column if exists employer,
      drop column if exists pac_number,
      drop column if exists pac_service_number_1,
      drop column if exists pac_service_number_2;
  `);
}
