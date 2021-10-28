import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  const sql = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;

  DROP TRIGGER IF EXISTS activity_deleted on invasivesbc.activity_incoming_data;

  CREATE OR REPLACE FUNCTION delete_last_activity()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS
      $$
      BEGIN
          update invasivesbc.activity_incoming_data
          set deleted_timestamp = NOW()
          where activity_id = new.activity_id
          and deleted_timestamp is null;
          RETURN NEW;
      END;
      $$;

  CREATE TRIGGER activity_deleted
  BEFORE insert on invasivesbc.activity_incoming_data
  FOR EACH  ROW 
      EXECUTE PROCEDURE delete_last_activity();

 
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

    DROP TRIGGER IF EXISTS activity_deleted on invasivesbc.activity_incoming_data;
  `);
}
