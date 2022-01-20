import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema 'invasivesbc';
    set search_path = invasivesbc,public;
    create table if not exists access_request(
        access_request_id serial primary key,
        idir_account_name varchar(100) null,
        bceid_account_name varchar(100) null,
        first_name varchar(50) not null,
        last_name varchar(50) not null,
        primary_email varchar(100) not null unique,
        work_phone_number varchar(25) null,
        funding_agencies varchar(1000),
        pac_number varchar(100),
        employer varchar(100),
        pac_service_number_1 varchar(1000),
        pac_service_number_2 varchar(1000),
        comments varchar(1000),
        status varchar(100) default 'Awaiting Approval' not null
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table if exists access_request;
  `);
}
