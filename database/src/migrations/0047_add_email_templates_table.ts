import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = invasivesbc,public;
    create table invasivesbc.email_templates (
      email_template_id serial2 NOT NULL,
      from_email varchar NOT NULL,
      email_subject varchar NOT NULL,
      email_body varchar NULL,
      CONSTRAINT email_templates_pk PRIMARY KEY (email_template_id)
    );
    INSERT INTO invasivesbc.email_templates
    (from_email, email_subject, email_body)
    VALUES('', '', '');
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  drop table invasivesbc.email_templates;
  `);
}
