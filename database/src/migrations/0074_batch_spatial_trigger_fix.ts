import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set 
    search_path = invasivesbc, 
    public;
    
    CREATE OR REPLACE FUNCTION invasivesbc.context_autofill()
    RETURNS trigger
    LANGUAGE plpgsql
   AS $function$
       BEGIN
           UPDATE invasivesbc.activity_incoming_data
           SET invasive_plant_management_areas = (
             select
             ipma
           from
             public.invasive_plant_management_areas
           where
             public.st_intersects(
               public.st_geographyFromText(('POINT('::TEXT || (activity_payload->'form_data'->'activity_data'->>'longitude')::TEXT  || ' '::TEXT || (activity_payload->'form_data'->'activity_data'->>'latitude')::TEXT || ')'::TEXT)::TEXT),
               invasive_plant_management_areas.geog
             ) limit 1
         ),
         regional_invasive_species_organization_areas = (
             select
             string_agg(agency, ', ')
           from
             public.regional_invasive_species_organization_areas
           where
             public.st_intersects(
               public.st_geographyFromText(('POINT('::TEXT || (activity_payload->'form_data'->'activity_data'->>'longitude')::TEXT || ' '::TEXT || (activity_payload->'form_data'->'activity_data'->>'latitude')::TEXT || ')'::TEXT)::TEXT),
               regional_invasive_species_organization_areas.geog
             )
         ),
         regional_districts = (
             select
             agency
           from
             public.regional_districts
           where
             public.st_intersects(
               public.st_geographyFromText(('POINT('::TEXT || (activity_payload->'form_data'->'activity_data'->>'longitude')::TEXT || ' '::TEXT || (activity_payload->'form_data'->'activity_data'->>'latitude')::TEXT || ')'::TEXT)::TEXT),
               regional_districts.geog
             ) limit 1
       )
           WHERE activity_id  =  NEW.activity_id;
           
           RETURN NEW;
        END;
       $function$
   ;
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  `);
}
