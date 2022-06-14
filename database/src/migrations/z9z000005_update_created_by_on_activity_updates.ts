import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  const sql = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;

  DROP TRIGGER IF EXISTS update_created_by_on_activity_updates on invasivesbc.activity_incoming_data;

  CREATE OR REPLACE FUNCTION update_created_by_on_activity_updates_function()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS
      $$
      BEGIN
          UPDATE invasivesbc.activity_incoming_data
          SET created_by = (
            SELECT created_by 
            FROM invasivesbc.activity_incoming_data 
            WHERE NEW.activity_id = activity_id 
            AND created_by IS NOT null
            ORDER BY created_timestamp ASC
            LIMIT 1
          )
          WHERE activity_id = new.activity_id
          AND NEW.created_by is null;
          RETURN new;
      END
      $$;

      CREATE TRIGGER update_created_by_on_activity_updates
      AFTER insert on invasivesbc.activity_incoming_data
      FOR EACH  ROW 
        EXECUTE PROCEDURE update_created_by_on_activity_updates_function();

 
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

    DROP TRIGGER IF EXISTS update_created_by_on_activity_updates on invasivesbc.activity_incoming_data;
  `);
}
