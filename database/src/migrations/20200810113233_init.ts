import Knex from 'knex';

const DB_SCHEMA = 'invasivesbc';

/**
 * Create the `DB_SCHEMA` schema.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    CREATE SCHEMA IF NOT EXISTS ${DB_SCHEMA};

    ALTER SCHEMA ${DB_SCHEMA} OWNER TO invasivebc;
  `);
}

/**
 * Drop the `DB_SCHEMA` schema.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    DROP SCHEMA IF EXISTS ${DB_SCHEMA};
  `);
}
