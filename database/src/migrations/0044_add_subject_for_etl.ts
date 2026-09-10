import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  //language=PostgreSQL
  await knex.raw(
    `
      set search_path = invasivesbc,public;

      alter table activity_incoming_data
        add column if not exists subject varchar(40) null;
      comment on column activity_incoming_data.subject is 'Store the SSO subject of the modifying user for future versions of the application where it will become the primary way of identifying users';
    `
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path = invasivesbc,public;

      alter table activity_incoming_data drop column subject;
    `
  );
}
