import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

/**
 * Adds a text array column `media_keys`.
 *
 * @export
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN media_keys text[];
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.media_keys IS 'Array of keys used to fetch original files from external storage';
  `);
}

/**
 * Drops the column `media_keys`.
 *
 * @export
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE IF EXISTS ${DB_SCHEMA}.activity_incoming_data DROP COLUMN media_keys;
  `);
}
