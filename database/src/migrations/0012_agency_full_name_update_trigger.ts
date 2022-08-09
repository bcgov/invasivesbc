import { Knex } from 'knex';

const table_name = 'admin_defined_shapes';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  --      migration     --

  set search_path=invasivesbc,public;

  -- Add column to pull agencies from
  ALTER TABLE activity_incoming_data DROP COLUMN IF EXISTS agency, ADD COLUMN agency TEXT;

  -- Get mapping table of agencies
  WITH codes AS 
    (SELECT * FROM code WHERE code_header_id = 181),
  -- Get rows of the listed agencies
  payload AS 
    (SELECT 
      activity_incoming_data_id AS id,
      string_to_array(activity_payload->'form_data'->'activity_data'->>'invasive_species_agency_code', ',') AS acronym 
    FROM activity_incoming_data),
  -- Map unnested rows to proper. full code_description names
  mapped AS 
    (SELECT id, unnested_code_name, code_description 
    FROM 
      (SELECT id, UNNEST(acronym) AS unnested_code_name FROM payload) AS foo, 
      codes
    WHERE code_name = unnested_code_name),
  -- Collect mapped descriptions by their id
  collected AS
    (SELECT id, array_to_string(ARRAY_AGG(code_description), ', ') AS agency_list FROM mapped GROUP BY id)
  -- Update column
  UPDATE activity_incoming_data
  SET agency = agency_list
  FROM collected
  WHERE activity_incoming_data_id = collected.id;



  CREATE OR REPLACE FUNCTION agency_mapping()
      RETURNS TRIGGER
      LANGUAGE PLPGSQL
      AS  
  $$
  BEGIN
    set search_path=invasivesbc,public;
    
    -- Get mapping table of agencies
    WITH codes AS 
      (SELECT * FROM code WHERE code_header_id = 181),
    -- Get rows of the listed agencies
    payload AS 
      (SELECT 
        activity_incoming_data_id AS id,
        string_to_array(activity_payload->'form_data'->'activity_data'->>'invasive_species_agency_code', ',') AS acronym 
      FROM activity_incoming_data),
    -- Map unnested rows to proper. full code_description names
    mapped AS 
      (SELECT id, unnested_code_name, code_description 
      FROM 
        (SELECT id, UNNEST(acronym) AS unnested_code_name FROM payload) AS foo, 
        codes
      WHERE code_name = unnested_code_name),
    -- Collect mapped descriptions by their id
    collected AS
      (SELECT id, array_to_string(ARRAY_AGG(code_description), ', ') AS agency_list FROM mapped GROUP BY id)
    
    -- Update column
    UPDATE activity_incoming_data
    SET agency = agency_list
    FROM collected
    WHERE activity_incoming_data_id = collected.id AND activity_incoming_data_id = NEW.activity_incoming_data_id;

      RETURN NEW;
  END
  $$;

  DROP TRIGGER IF EXISTS agency_full_name ON activity_incoming_data;
  CREATE TRIGGER agency_full_name 
  AFTER INSERT 
  ON activity_incoming_data
  FOR EACH ROW 
  EXECUTE PROCEDURE agency_mapping();
  END
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`set schema 'invasivesbc';
    set search_path = invasivesbc,public;
    DROP TRIGGER IF EXISTS agency_full_name ON activity_incoming_data;`);
}
