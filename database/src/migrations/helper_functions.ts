import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  const sql = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;




  CREATE  or replace  FUNCTION public.convert_string_list_to_array_elements(text) RETURNS TABLE(f1 text)
  AS $$ SELECT  unnest(('{' || $1::text || '}')::text[]); $$
  LANGUAGE SQL;

CREATE  or replace  FUNCTION public.convert_string_list_to_array_elements(unknown) RETURNS TABLE(f1 text)
  AS $$ SELECT  unnest(('{' || $1::text || '}')::text[]); $$
  LANGUAGE SQL;
    
 
 
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

    drop function invasivesbc.convert_string_list_to_array_elements ;
  `);
}
