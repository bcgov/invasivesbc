import * as fs from 'fs';
import Knex from 'knex';
import * as path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

/**
 * Restores the `dumps/lucy_web_prod_schema_only_20201021.sql` database dump, which is schema only (no data).
 *
 * SQL generated via the `pg_dump` command.
 *
 * Ex: `pg_dump --schema-only InvasivesBC > outfile.sql`
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const buffer = fs.readFileSync(path.join(__dirname, '../sql/lucy_web_prod_schema_only_20201021.sql'));

  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ${buffer}
  `);
}

/**
 * TODO: This would likely just need to drop the entire database?
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {}
