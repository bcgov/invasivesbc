import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    SET search_path = invasivesbc, public;
    ALTER TABLE invasivesbc.email_templates ADD template_name varchar;

    UPDATE invasivesbc.email_templates
    SET template_name='Approved'
    WHERE email_template_id=1;

    ALTER TABLE invasivesbc.email_templates ALTER COLUMN template_name SET NOT NULL;

    INSERT INTO invasivesbc.email_templates
    (from_email, email_subject, email_body, template_name)
    VALUES('', '', '', 'Declined');
    `
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=invasivesbc,public;
  `);
}
