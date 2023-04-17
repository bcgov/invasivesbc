import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export const update_all_summary_views = `

set
  search_path = invasivesbc,
  public;

  CREATE TABLE error_log (
    id SERIAL PRIMARY KEY,
    error jsonb NOT NULL,
    client_state JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
    created_by varchar NULL;
    created_by_with_guid varchar NULL;
);

      `;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(update_all_summary_views);
}

/**
 * Drop the `error` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    drop table client_error_log;
  `);
}
