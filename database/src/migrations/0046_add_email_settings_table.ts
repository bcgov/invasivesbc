import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = invasivesbc,public;
    create table invasivesbc.email_settings (
      email_setting_id serial2 NOT NULL,
      enabled boolean default false,
      authentication_url varchar NOT NULL,
      email_service_url varchar NOT NULL,
      client_id varchar NOT NULL,
      client_secret varchar NOT NULL,
      CONSTRAINT email_settings_pk PRIMARY KEY (email_setting_id)
    );
    INSERT INTO invasivesbc.email_settings
    (enabled, authentication_url, email_service_url, client_id, client_secret)
    VALUES(false, '', '', '', '');
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  drop table invasivesbc.email_settings;
  `);
}
