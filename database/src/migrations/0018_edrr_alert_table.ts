import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  
  await knex.raw(`
  	set search_path=invasivesbc,public;

      create 
      or replace view edrr_species as (
        with species_select as (
          select 
            activity_incoming_data_id, 
            species_positive, 
            regional_districts, 
            created_timestamp, 
            received_timestamp, 
            now() as times 
          from 
            activity_incoming_data 
          where 
            species_positive != 'null' 
            and species_positive is not null 
            and activity_incoming_data_id in (
              select 
                incoming_data_id 
              from 
                activity_current
            ) 
            and form_status = 'Submitted' 
            and received_timestamp >= now() + interval '6 hours'
        ), 
        species_array as (
          select 
            activity_incoming_data_id, 
            jsonb_array_elements_text(species_positive) as species_positive, 
            regional_districts, 
            created_timestamp, 
            received_timestamp 
          from 
            species_select
        ), 
        species_names as (
          select 
            activity_incoming_data_id, 
            species_positive, 
            invasive_plant_codes.code_description as terrestrial_invasive_plant, 
            invasive_plant_aquatic_codes.code_description as aquatic_invasive_plant, 
            regional_districts, 
            created_timestamp, 
            received_timestamp 
          from 
            species_array 
            left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
            and invasive_plant_aquatic_code_header.valid_to is null 
            left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
            and species_positive = invasive_plant_aquatic_codes.code_name 
            left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
            and invasive_plant_code_header.valid_to is null 
            left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
            and species_positive = invasive_plant_codes.code_name
        ) 
        select 
          activity_incoming_data_id, 
          species_positive, 
          coalesce(
            terrestrial_invasive_plant, aquatic_invasive_plant
          ) as invasive_plant, 
          regional_districts, 
          created_timestamp, 
          received_timestamp 
        from 
          species_names 
        where 
          species_positive like '%AR%' 
          or species_positive like '%BH%' 
          or species_positive like '%ED%' 
          or species_positive like '%AM%' 
          or species_positive like '%CC%' 
          or species_positive like '%RC%' 
          or species_positive like '%DC%' 
          or species_positive like '%SN%' 
          or species_positive like '%SA%' 
          or species_positive like '%EC%' 
          or species_positive like '%DW%' 
          or species_positive like '%ES%' 
          or species_positive like '%BF%' 
          or species_positive like '%FR%' 
          or species_positive like '%FT%' 
          or species_positive like '%RG%' 
          or species_positive like '%AH%' 
          or species_positive like '%ME%' 
          or species_positive like '%WH%' 
          or species_positive like '%HY%' 
          or species_positive like '%GJ%' 
          or species_positive like '%JG%' 
          or species_positive like '%CV%' 
          or species_positive like '%KU%' 
          or species_positive like '%MC%' 
          or species_positive like '%TM%' 
          or species_positive like '%NS%' 
          or species_positive like '%PN%' 
          or species_positive like '%PP%' 
          or species_positive like '%BR%' 
          or species_positive like '%CE%' 
          or species_positive like '%MS%' 
          or species_positive like '%MV%' 
          or species_positive like '%TP%' 
          or species_positive like '%IS%' 
          or species_positive like '%MX%' 
          or species_positive like '%PU%' 
          or species_positive like '%YS%' 
          or species_positive like '%SY%' 
          or species_positive like '%TX%' 
          or species_positive like '%IT%' 
          or species_positive like '%WT%' 
          or species_positive like '%LW%' 
          or species_positive like '%AQ%' 
          or species_positive like '%YF%'
      );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    DROP view if exists invasivesbc.edrr_species;
    `);
}
