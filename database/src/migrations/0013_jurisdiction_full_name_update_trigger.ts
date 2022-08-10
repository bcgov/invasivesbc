import { Knex } from 'knex';

const table_name = 'admin_defined_shapes';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  --				migration				--

  set search_path=invasivesbc,public;

  ALTER TABLE activity_incoming_data DROP COLUMN IF EXISTS jurisdiction_display, ADD COLUMN jurisdiction_display TEXT;

  -- Get mapping table
  WITH codes AS
    (SELECT * FROM code WHERE code_header_id = (
      SELECT code_header_id FROM code_header WHERE code_header_description = 'jurisdiction_code')
    ),
  -- Get jurisdiction codes
  mapped AS
    (SELECT activity_id, jurisdiction_percentage, code_description
  FROM activity_jurisdictions, codes
  WHERE jurisdiction_code = code_name),
  -- Collect jurisdiction codes into strings 
  stringified AS
    (SELECT 
      activity_id, 
      STRING_AGG(code_description::text || ' (' || jurisdiction_percentage::TEXT || '%)', ', ') AS jurisdictions
    FROM mapped
    GROUP BY activity_id)
    

  UPDATE activity_incoming_data 
  SET jurisdiction_display = s.jurisdictions
  FROM stringified s
  WHERE activity_incoming_data.activity_id = s.activity_id;
    

  --				trigger				--
    

  CREATE OR REPLACE FUNCTION jurisdiction_mapping()
      RETURNS TRIGGER
      LANGUAGE PLPGSQL
      AS
  $$
  BEGIN
    set search_path=invasivesbc,public;

    -- Get mapping table
    WITH codes AS 
      (SELECT * FROM code WHERE code_header_id = (
        SELECT code_header_id FROM code_header WHERE code_header_description = 'jurisdiction_code')
      ),
    -- Get jurisdiction codes
    mapped AS 
      (SELECT activity_id, jurisdiction_percentage, code_description
    FROM activity_jurisdictions, codes
    WHERE jurisdiction_code = code_name),
    -- Collect jurisdiction codes into strings
    stringified AS
      (SELECT
        activity_id,
        STRING_AGG(code_description::text || ' (' || jurisdiction_percentage::TEXT || '%)', ', ') AS jurisdictions
      FROM mapped
      GROUP BY activity_id)


    UPDATE activity_incoming_data
    SET jurisdiction_display = s.jurisdictions
    FROM stringified s
    WHERE activity_incoming_data.activity_id = s.activity_id
    AND activity_incoming_data.activity_id = NEW.activity_id;

    RETURN NEW;
  END
  $$;

  DROP TRIGGER IF EXISTS jurisdiction_full_name ON activity_incoming_data;
  CREATE TRIGGER jurisdiction_full_name 
  AFTER INSERT 
  ON activity_incoming_data
  FOR EACH ROW 
  EXECUTE PROCEDURE jurisdiction_mapping();
  END

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`set schema 'invasivesbc';
    set search_path = invasivesbc,public;
    DROP TRIGGER IF EXISTS jurisdiction_full_name ON activity_incoming_data;`);
}
