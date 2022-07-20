import Knex from 'knex';
import { extract_sql_and_reports } from './z4';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  let sql = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;
  drop view if exists invasivesbc.activity_current cascade;
  create view  invasivesbc.activity_current as (
  select activity_id, max(activity_incoming_data_id) as incoming_data_id from 
  invasivesbc.activity_incoming_data
  where deleted_timestamp is null
  group by activity_id
  );

  `;

  // need to redo last migration afer deleting dependent tables
  sql += extract_sql_and_reports;

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
