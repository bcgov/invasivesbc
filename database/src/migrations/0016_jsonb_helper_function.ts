import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // this function is to help convert jsonb to charvar[] for the psql udpate affecting species filtering
  // borrowed from https://dba.stackexchange.com/questions/54283/how-to-turn-json-array-into-postgres-array/54289#54289
  await knex.raw(`
  	set search_path=invasivesbc,public;

    CREATE OR REPLACE FUNCTION jsonb_array_to_text_array(_js jsonb)
    RETURNS text[]
    LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
    'SELECT ARRAY(SELECT jsonb_array_elements_text(_js))';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    DROP FUNCTION jsonb_array_to_text_array(_js jsonb);
    `);
}
