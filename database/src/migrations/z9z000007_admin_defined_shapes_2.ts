import * as Knex from 'knex';

const table_name = 'admin_defined_shapes';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`set schema 'invasivesbc';
    set search_path = invasivesbc,public;
    drop table if exists ${table_name};
    set client_encoding to utf8;
    set standard_conforming_strings to on;
    create table ${table_name} (
      id serial primary key,
      visible boolean not null default true,
      created_at timestamp without time zone not null default current_timestamp,
      created_by varchar(100) null,
      title varchar(100),
      geog geography(multiPolygon, 4326)
    );

    comment on column invasivesbc.${table_name}.visible is 'show or hide this shape';
    comment on column invasivesbc.${table_name}.created_at is 'creation timestamp';
    comment on column invasivesbc.${table_name}.created_by is 'ID of uploading user or null if system/unknown';
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`set schema 'invasivesbc';
    set search_path = invasivesbc,public;
    drop table if exists  ${table_name};`);
}
