import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;

    CREATE OR REPLACE FUNCTION invasivesbc.short_id_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN WITH short_payload AS (
    SELECT 
      activity_id AS id, 
      activity_payload ->> 'short_id' AS short_id 
    FROM 
      invasivesbc.activity_incoming_data
      where activity_id = NEW.activity_id
  ) 
  UPDATE 
    invasivesbc.activity_incoming_data 
  SET 
    short_id = sp.short_id 
  FROM 
    short_payload sp 
  WHERE 
    activity_id = sp.id 
    AND activity_incoming_data_id = NEW.activity_incoming_data_id;
  RETURN NEW;
  END $function$
;




CREATE OR REPLACE FUNCTION invasivesbc.agency_mapping()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
  BEGIN
    set search_path=invasivesbc,public;
    
    -- Get mapping table of agencies
    WITH codes AS 
      (SELECT * FROM code WHERE code_header_id = (
        SELECT code_header_id FROM code_header WHERE code_header_description = 'invasive_species_agency_code')
      ),
    -- Get rows of the listed agencies
    payload AS 
      (SELECT 
        activity_incoming_data_id AS id,
        string_to_array(activity_payload->'form_data'->'activity_data'->>'invasive_species_agency_code', ',') AS acronym 
      FROM activity_incoming_data where activity_id = NEW.activity_id),
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
  $function$
;

CREATE OR REPLACE FUNCTION invasivesbc.code_to_name()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
  BEGIN
      set search_path=invasivesbc,public;
    

    WITH species_code_by_activity_id AS (
    
      SELECT aid.activity_incoming_data_id, 
          aid.activity_id,
          
          case when jsonb_typeof(species_positive) <> 'array' or species_positive  = '[]' 
          then '[null]' else jsonb_array_elements_text(species_positive) 
          end AS positive_code,
          
          case when jsonb_typeof(species_negative) <> 'array' or species_negative  = '[]' 
          then '[null]' else jsonb_array_elements_text(species_negative) 
          end AS negative_code, 

          case when jsonb_typeof(species_treated) <> 'array' or species_treated  = '[]' 
          then '[null]' else jsonb_array_elements_text(species_treated) 
          end AS treated_code
          
      FROM 
        invasivesbc.activity_incoming_data aid   
      inner join invasivesbc.activity_current ac on ac.incoming_data_id = aid.activity_incoming_data_id 
              
      where ac.activity_id = new.activity_id
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
    
      
    where ac.activity_id = new.activity_id
    )
    
    UPDATE activity_incoming_data aid
    SET 	species_positive_full = sf.species_positive_full,
        species_negative_full = sf.species_negative_full,
        species_treated_full = sf.species_treated_full
        
    FROM 	species_full_descriptions_by_activity_id sf
    
    WHERE 	aid.activity_incoming_data_id = sf.activity_incoming_data_id
    and 	aid.activity_incoming_data_id = new.activity_incoming_data_id
    and 	aid.activity_id = new.activity_id;
          
      RETURN NEW;
  END
  $function$
;

`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path = invasivesbc,public;

  `);
}
