import * as Knex from 'knex';
//For now moving to one consolidated migration for plant reporting.

//Why:  Knex silently failing on view create, making troubleshooting which of the 10+ plant views is failing.
//      Deploying plant views then becomes a process of manually pasting the sql to the db.
//      Having one consolidated file allows for quick troubleshooting and deployments.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  	set search_path=invasivesbc,public;
    set search_path=invasivesbc,public;

    create view invasivesbc.iapp_species_status as (
    with most_recent_positive_occurences as (
    
      select site_id, max(survey_date) as positive_occurrence_date, invasive_plant ---,  'maybe' as positive_l, 'maybe' as negative_l
      from survey_extract se 
      where estimated_area_hectares > 0
      group by site_id, invasive_plant --, positive_l, negative_l
    
    ),
    most_recent_negative_occurrences as (
    
      select site_id, max(survey_date) as negative_occurrence_date, invasive_plant ---,  'maybe' as positive_l, 'maybe' as negative_l
      from survey_extract se 
      where estimated_area_hectares = 0
      group by site_id, invasive_plant --, positive_l, negative_l
    
    ),
    most_recent_both as (
      select a.site_id, a.invasive_plant, a.positive_occurrence_date, b.negative_occurrence_date
      from most_recent_positive_occurences a left join most_recent_negative_occurrences b on a.site_id = b.site_id and a.invasive_plant = b.invasive_plant
    ),
    site_species_status as (
    
      select site_id,
          invasive_plant,
          case 
            when 	
                positive_occurrence_date > negative_occurrence_date 
                or (positive_occurrence_date is not null and negative_occurrence_date is null)
              then true 
              
            else false 	
            end as is_species_positive,
            
            
            case 
            when 	
                negative_occurrence_date > positive_occurrence_date 
                or (negative_occurrence_date is not null and positive_occurrence_date is null)
              then true 
              
            else false 	
            end as is_species_negative
            
              
            
            
            
            
            
          from most_recent_both
    )
    
    select * from site_species_status order by is_species_negative desc
      );

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;
    drop materialized view if exists invasivesbc.iapp_species_status;
  `);
}
