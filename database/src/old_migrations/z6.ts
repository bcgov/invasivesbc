import Knex from 'knex';
import { extract_sql_and_reports } from './z4';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  let sql = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;
  alter table invasivesbc.activity_incoming_data 
  DROP  COLUMN  species_positive,
  DROP  COLUMN  species_negative,
  ADD  COLUMN  species_positive jsonb,
  ADD  COLUMN  species_negative jsonb;

  `;

  // need to redo last migration afer deleting dependent tables

  await knex.raw(sql);
}

/**
 * Drop the `application_user` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    drop view if exists invasivesbc.activity_current;
  `);
}
