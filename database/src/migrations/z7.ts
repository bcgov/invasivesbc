import Knex from 'knex';
import { extract_sql_and_reports } from './z4';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  const sql = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;
  drop view if exists invasivesbc.activity_jurisdictions;

  create or replace view  invasivesbc.activity_jurisdictions as (
  with jurisdictions as (
  
      select activity_incoming_data_id,
      jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') as jurisdictions_array
      from activity_incoming_data a
      inner join activity_current b on a.activity_incoming_data_id = b.incoming_data_id 
    )
    
  select a.activity_id, 
  a.activity_incoming_data_id,
  j.jurisdictions_array ,
  trim('"' from (j.jurisdictions_array -> 'jurisdiction_code')::text) as jurisdiction_code ,
    trim('"' from (j.jurisdictions_array -> 'percent_covered')::text)::float as jurisdiction_percentage 
    from activity_incoming_data a 
  inner join activity_current b on a.activity_incoming_data_id = b.incoming_data_id 
  left join jurisdictions j on j.activity_incoming_data_id = a.activity_incoming_data_id
  order by a.activity_id desc
  );

  alter table invasivesbc.activity_incoming_data drop column if exists jurisdiction ;
  alter table invasivesbc.activity_incoming_data add column jurisdiction VARCHAR[]  DEFAULT '{}';

  update invasivesbc.activity_incoming_data a set jurisdiction = (select array(select jurisdiction_code from invasivesbc.activity_jurisdictions where activity_incoming_data_id = a.activity_incoming_data_id));
  `;

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

    drop view if exists invasivesbc.activity_jurisdictions
  `);
}
