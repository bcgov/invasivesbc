import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    //language=PostgreSQL
    `
        set search_path = invasivesbc, public;

        create table export_records
        (
            id             serial primary key,
            export_time    timestamp without time zone not null default current_timestamp,
            export_type    varchar(32)                 not null check ( length(export_type) >= 4 ),
            last_record    integer                     null,
            file_reference varchar(512)                not null check ( length(file_reference) >= 4 )
        );
    `
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path = invasivesbc,public;

      drop table export_records;

    `);
}
