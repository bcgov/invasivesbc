import Knex from 'knex';
import { extract_sql_and_reports } from './z4';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  let sql = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;
  create view if not exists invasivesbc.activity_jurisdictions as (

    with jurisdictions as (
      select jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') as jurisdictions_array
      from activity_incoming_data a
      join activity_current b on a.activity_incoming_data_id = b.activity_incoming_data_id
    )
    select activity_id, 

  )

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
