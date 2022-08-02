import { Knex } from 'knex';

const table_name = 'admin_defined_shapes';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=invasivesbc,public;

  --      migration     --

  --create full name columns
  ALTER TABLE activity_incoming_data DROP COLUMN IF EXISTS species_positive_full, ADD COLUMN species_positive_full TEXT;
  ALTER TABLE activity_incoming_data DROP COLUMN IF EXISTS species_negative_full, ADD COLUMN species_negative_full TEXT;
  ALTER TABLE activity_incoming_data DROP COLUMN IF EXISTS species_treated_full, ADD COLUMN species_treated_full TEXT;

  --adapt species_treated to match
  ALTER TABLE activity_incoming_data ALTER COLUMN species_treated TYPE jsonb USING species_treated::jsonb;

  --fixes null values to allow for jsonb_array_elements_text function
  UPDATE activity_incoming_data
  SET species_positive  = '[null]'
  WHERE jsonb_typeof(species_positive) <> 'array' or species_positive  = '[]';

  UPDATE activity_incoming_data
  SET species_negative  = '[null]'
  WHERE jsonb_typeof(species_negative) <> 'array' or species_negative  = '[]';

  UPDATE activity_incoming_data
  SET species_treated  = '[null]'
  WHERE jsonb_typeof(species_treated) <> 'array' or species_treated  = '[]';

  --https://stackoverflow.com/questions/50296102/cannot-extract-elements-from-a-scalar

  --species_positive 
  WITH names AS (
    SELECT activity_incoming_data_id AS id, array_to_string(ARRAY_AGG(invbc_name), ', ') AS full_name FROM 
      iapp_invbc_mapping, 
      (SELECT jsonb_array_elements_text(species_positive) AS code, activity_incoming_data_id
        FROM activity_incoming_data
        GROUP BY activity_incoming_data_id
      ) AS sub 
    WHERE char_code = sub.code
    GROUP BY activity_incoming_data_id
  )

  UPDATE activity_incoming_data aid
  SET species_positive_full = names.full_name 
  FROM names
  WHERE aid.activity_incoming_data_id = names.id;

  --species_negative 
  WITH names AS (
    SELECT activity_incoming_data_id AS id, array_to_string(ARRAY_AGG(invbc_name), ', ') AS full_name FROM 
      iapp_invbc_mapping, 
      (SELECT jsonb_array_elements_text(species_negative) AS code, activity_incoming_data_id
        FROM activity_incoming_data
        GROUP BY activity_incoming_data_id
      ) AS sub 
    WHERE char_code = sub.code
    GROUP BY activity_incoming_data_id
  )

  UPDATE activity_incoming_data aid
  SET species_negative_full = names.full_name 
  FROM names
  WHERE aid.activity_incoming_data_id = names.id;

  --species_treated 
  WITH names AS (
    SELECT activity_incoming_data_id AS id, array_to_string(ARRAY_AGG(invbc_name), ', ') AS full_name FROM 
      iapp_invbc_mapping, 
      (SELECT jsonb_array_elements_text(species_treated) AS code, activity_incoming_data_id
        FROM activity_incoming_data
        GROUP BY activity_incoming_data_id
      ) AS sub 
    WHERE char_code = sub.code
    GROUP BY activity_incoming_data_id
  )

  UPDATE activity_incoming_data aid
  SET species_treated_full = names.full_name 
  FROM names
  WHERE aid.activity_incoming_data_id = names.id;


  --        trigger       --

  CREATE OR REPLACE FUNCTION code_to_name()
      RETURNS TRIGGER
      LANGUAGE PLPGSQL
      AS  
  $$
  BEGIN
      set search_path=invasivesbc,public;
    
      UPDATE activity_incoming_data
      SET species_positive  = '[null]'
      WHERE       (jsonb_typeof(species_positive) <> 'array' or species_positive  = '[]')
      AND         activity_incoming_data_id  =  (  select activity_incoming_data_id 
                                                  from activity_current 
                                                  where activity_current.activity_id = new.activity_id
    );

    UPDATE activity_incoming_data
      SET species_negative  = '[null]'
      WHERE       (jsonb_typeof(species_negative) <> 'array' or species_negative  = '[]')
      AND         activity_incoming_data_id  =  (  select activity_incoming_data_id 
                                                  from activity_current 
                                                  where activity_current.activity_id = new.activity_id
    );

    UPDATE activity_incoming_data
      SET species_treated  = '[null]'
      WHERE       (jsonb_typeof(species_treated) <> 'array' or species_treated  = '[]')
      AND         activity_incoming_data_id  =  (  select activity_incoming_data_id 
                                                  from activity_current 
                                                  where activity_current.activity_id = new.activity_id
    );

    WITH species_code_by_activity_id AS (
    
      SELECT aid.activity_incoming_data_id, 
          aid.activity_id,
          jsonb_array_elements_text(species_positive) AS positive_code,
          jsonb_array_elements_text(species_negative) AS negative_code,
          jsonb_array_elements_text(species_treated) AS treated_code
      FROM 
        invasivesbc.activity_incoming_data aid   
      inner join invasivesbc.activity_current ac on ac.incoming_data_id = aid.activity_incoming_data_id 
              
      GROUP BY activity_incoming_data_id
    ),
    species_positive_translated_by_activity_id as (
    
      select im.char_code, sid.positive_code, im.invbc_name, sid.activity_id, sid.activity_incoming_data_id
      from 	iapp_invbc_mapping im
      inner join species_code_by_activity_id sid on sid.positive_code = im.char_code
    
    ),
      species_negative_translated_by_activity_id as (
    
      select im.char_code, sid.negative_code, im.invbc_name, sid.activity_id, sid.activity_incoming_data_id
      from 	iapp_invbc_mapping im
      inner join species_code_by_activity_id sid on sid.negative_code = im.char_code
    
    ),
    species_treated_translated_by_activity_id as (
    
      select im.char_code, sid.treated_code, im.invbc_name, sid.activity_id, sid.activity_incoming_data_id
      from 	iapp_invbc_mapping im
      inner join species_code_by_activity_id sid on sid.treated_code = im.char_code
    
    ),
    species_positive_description_aggregated_by_activity_id as (
      select array_to_string(ARRAY_AGG(st.invbc_name), ', ') as species_positive_full,
      st.activity_id,
      st.activity_incoming_data_id
      from species_positive_translated_by_activity_id st
      group by st.activity_id, st.activity_incoming_data_id
    ),
    species_negative_description_aggregated_by_activity_id as (
          select array_to_string(ARRAY_AGG(st.invbc_name), ', ') as species_negative_full, 
          st.activity_id,
          st.activity_incoming_data_id
          from species_negative_translated_by_activity_id st
          group by st.activity_id, st.activity_incoming_data_id
    ),   
    species_treated_description_aggregated_by_activity_id as (
        select array_to_string(ARRAY_AGG(st.invbc_name), ', ') as species_treated_full, 
        st.activity_id,
        st.activity_incoming_data_id
        from species_treated_translated_by_activity_id st
        group by st.activity_id, st.activity_incoming_data_id
    ),
    species_full_descriptions_by_activity_id as (
    select ac.activity_id, ac.incoming_data_id AS activity_incoming_data_id, species_positive_full, species_negative_full, species_treated_full  
    from activity_current ac 
    left join species_positive_description_aggregated_by_activity_id sp on sp.activity_id = ac.activity_id
      left join species_negative_description_aggregated_by_activity_id sn on sn.activity_id = ac.activity_id 
      left join species_treated_description_aggregated_by_activity_id st on st.activity_id = ac.activity_id 
    )
      
    
    UPDATE activity_incoming_data aid
    SET 	species_positive_full = sf.species_positive_full,
        species_negative_full = sf.species_negative_full,
        species_treated_full = sf.species_treated_full
        
    FROM 	species_full_descriptions_by_activity_id sf
    
    WHERE 	aid.activity_incoming_data_id = sf.activity_incoming_data_id
    and 	aid.activity_incoming_data_id = new.activity_incoming_data_id;
          
      RETURN NEW;
  END
  $$;

  DROP TRIGGER IF EXISTS species_full_name ON activity_incoming_data;
  CREATE TRIGGER species_full_name 
  AFTER INSERT 
  ON activity_incoming_data
  FOR EACH ROW 
  EXECUTE PROCEDURE code_to_name();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`set schema 'invasivesbc';
    set search_path = invasivesbc,public;
    DROP TRIGGER IF EXISTS species_full_name ON activity_incoming_data;`);
}
