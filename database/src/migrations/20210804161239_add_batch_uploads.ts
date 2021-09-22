import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -- ### Adding offline sync controls for ${DB_SCHEMA}.activity_incoming_data ### --

    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    create type ${DB_SCHEMA}.batch_upload_status as enum  (
      'NEW',
      'PROCESSING',
      'ERROR',
      'SUCCESS'
    );

    create type ${DB_SCHEMA}.validation_status as enum  (
      'VALID',
      'INVALID'
    );


    create table ${DB_SCHEMA}.batch_uploads (
      id serial,
      csv_data text not null,
      status ${DB_SCHEMA}.batch_upload_status not null default 'NEW',
      validation_status ${DB_SCHEMA}.validation_status null,
      validation_messages jsonb null,
      created_object_details jsonb null,
      created_at timestamp without time zone not null default current_timestamp,
      created_by varchar(100) not null
    );

    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    -- ### Adding offline sync controls for ${DB_SCHEMA}.activity_incoming_data ### --

    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    drop table ${DB_SCHEMA}.batch_uploads;
    drop type ${DB_SCHEMA}.batch_upload_status;
    drop type ${DB_SCHEMA}.validation_status;
    `);
}
