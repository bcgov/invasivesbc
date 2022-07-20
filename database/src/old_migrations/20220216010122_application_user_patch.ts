import * as Knex from 'knex';
const DB_SCHEMA = 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        ALTER TABLE IF EXISTS ${DB_SCHEMA}.application_user ALTER COLUMN activation_status SET DEFAULT 0;
        ALTER TABLE IF EXISTS ${DB_SCHEMA}.access_request ADD COLUMN request_type varchar(15) default 'ACCESS';
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        ALTER TABLE IF EXISTS ${DB_SCHEMA}.application_user ALTER COLUMN activation_status SET DEFAULT 1;
        ALTER TABLE IF EXISTS ${DB_SCHEMA}.access_request DROP COLUMN request_type;
    `);
}
