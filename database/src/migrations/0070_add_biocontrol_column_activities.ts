import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set 
    search_path = invasivesbc, 
    public;
  
   ALTER TABLE activity_incoming_data DROP COLUMN IF EXISTS species_biocontrol_full, ADD COLUMN species_biocontrol_full TEXT;
  
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
            end AS treated_code,
            
            case when jsonb_typeof(coalesce(activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Collection_Information}', 
            activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
            activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
            activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information}')) <> 'array' 
            then '[null]' else jsonb_array_elements(coalesce(activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Collection_Information}', 
            activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
            activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
            activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information}')) 
            end AS biocontrol_code
            
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
      species_biocontrol_translated_by_activity_id as (
      
        select im.code_name, sid.biocontrol_code ->> 'biological_agent_code', im.code_description, sid.activity_id, sid.activity_incoming_data_id
        from 	code im
        inner join species_code_by_activity_id sid on sid.biocontrol_code ->> 'biological_agent_code' = im.code_name
        where im.code_header_id = 43
      
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
      species_biocontrol_description_aggregated_by_activity_id as (
          select array_to_string(ARRAY_AGG(st.code_description), ', ') as species_biocontrol_full, 
          st.activity_id,
          st.activity_incoming_data_id
          from species_biocontrol_translated_by_activity_id st
          group by st.activity_id, st.activity_incoming_data_id
      ),
      species_full_descriptions_by_activity_id as (
      select ac.activity_id, ac.incoming_data_id AS activity_incoming_data_id, species_positive_full, species_negative_full, species_treated_full, species_biocontrol_full  
      from activity_current ac 
      left join species_positive_description_aggregated_by_activity_id sp on sp.activity_id = ac.activity_id
      left join species_negative_description_aggregated_by_activity_id sn on sn.activity_id = ac.activity_id 
      left join species_treated_description_aggregated_by_activity_id st on st.activity_id = ac.activity_id 
      left join species_biocontrol_description_aggregated_by_activity_id sb on sb.activity_id = ac.activity_id
        
      where ac.activity_id = new.activity_id
      )
      
      UPDATE activity_incoming_data aid
      set species_positive_full = sf.species_positive_full,
          species_negative_full = sf.species_negative_full,
          species_treated_full = sf.species_treated_full,
          species_biocontrol_full = sf.species_biocontrol_full
          
      FROM 	species_full_descriptions_by_activity_id sf
      
      WHERE 	aid.activity_incoming_data_id = sf.activity_incoming_data_id
      and 	aid.activity_incoming_data_id = new.activity_incoming_data_id
      and 	aid.activity_id = new.activity_id;
            
        RETURN NEW;
    END
    $function$
    ;
    
    WITH species_code_by_activity_id AS (
      
        SELECT aid.activity_incoming_data_id, 
            aid.activity_id,
  
            case when jsonb_typeof(coalesce(activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Collection_Information}', 
            activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
            activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
            activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information}')) <> 'array' 
            then '[null]' else jsonb_array_elements(coalesce(activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Collection_Information}', 
            activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
            activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
            activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information}')) 
            end AS biocontrol_code
            
        FROM 
          invasivesbc.activity_incoming_data aid   
        inner join invasivesbc.activity_current ac on ac.incoming_data_id = aid.activity_incoming_data_id 
  
        GROUP BY activity_incoming_data_id
      ),
      species_biocontrol_translated_by_activity_id as (
      
        select im.code_name, sid.biocontrol_code ->> 'biological_agent_code', im.code_description, sid.activity_id, sid.activity_incoming_data_id
        from 	code im
        inner join species_code_by_activity_id sid on sid.biocontrol_code ->> 'biological_agent_code' = im.code_name
        where im.code_header_id = 43
      
      ),
      species_biocontrol_description_aggregated_by_activity_id as (
          select array_to_string(ARRAY_AGG(st.code_description), ', ') as species_biocontrol_full, 
          st.activity_id,
          st.activity_incoming_data_id
          from species_biocontrol_translated_by_activity_id st
          group by st.activity_id, st.activity_incoming_data_id
      ),
      species_full_descriptions_by_activity_id as (
      select ac.activity_id, ac.incoming_data_id AS activity_incoming_data_id, species_biocontrol_full  
      from activity_current ac 
      left join species_biocontrol_description_aggregated_by_activity_id sb on sb.activity_id = ac.activity_id
        
      )
      
      UPDATE activity_incoming_data aid
      set species_biocontrol_full = sf.species_biocontrol_full
          
      FROM 	species_full_descriptions_by_activity_id sf
      
      WHERE 	aid.activity_incoming_data_id = sf.activity_incoming_data_id;
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  `);
}
