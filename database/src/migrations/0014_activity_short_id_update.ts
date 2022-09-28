import { Knex } from 'knex';

const table_name = 'admin_defined_shapes';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set 
  search_path = invasivesbc, 
  public;
  -- Add column to pull agencies from
  ALTER TABLE 
    activity_incoming_data 
  DROP 
    COLUMN IF EXISTS short_id, 
  ADD 
    COLUMN short_id TEXT;
  -- Migration part
  WITH short_payload AS (
    SELECT 
      activity_id AS id, 
      activity_payload ->> 'short_id' AS short_id 
    FROM 
      activity_incoming_data
  ) 
  UPDATE 
    activity_incoming_data 
  SET 
    short_id = sp.short_id 
  FROM 
    short_payload sp 
  WHERE 
    activity_id = sp.id;
  -- Trigger part
  CREATE 
  OR REPLACE FUNCTION short_id_update() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$ BEGIN WITH short_payload AS (
    SELECT 
      activity_id AS id, 
      activity_payload ->> 'short_id' AS short_id 
    FROM 
      activity_incoming_data
  ) 
  UPDATE 
    activity_incoming_data 
  SET 
    short_id = sp.short_id 
  FROM 
    short_payload sp 
  WHERE 
    activity_id = sp.id 
    AND activity_incoming_data_id = NEW.activity_incoming_data_id;
  RETURN NEW;
  END $$;
  DROP 
    TRIGGER IF EXISTS activity_short_id ON activity_incoming_data;
  CREATE TRIGGER activity_short_id 
  AFTER 
    INSERT ON activity_incoming_data FOR EACH ROW EXECUTE PROCEDURE short_id_update();
  END
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`set schema 'invasivesbc';
    set search_path = invasivesbc,public;
    DROP TRIGGER IF EXISTS activity_short_id ON activity_incoming_data;`);
}
