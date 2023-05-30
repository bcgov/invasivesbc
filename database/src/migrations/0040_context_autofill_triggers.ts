import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    --function for trigger
    CREATE OR REPLACE FUNCTION context_autofill() RETURNS TRIGGER AS $$
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
		      )
	    ),
	    regional_invasive_species_organization_areas = (
	        select
		      agency
		    from
		      public.regional_invasive_species_organization_areas
		    where
		      public.st_intersects(
		        public.st_geographyFromText(('POINT('::TEXT || (activity_payload->'form_data'->'activity_data'->>'longitude')::TEXT || ' '::TEXT || (activity_payload->'form_data'->'activity_data'->>'latitude')::TEXT || ')'::TEXT)::TEXT),
		        regional_invasive_species_organization_areas.geog
		      )
	    )
        WHERE activity_id  =  NEW.activity_id;
        
        RETURN NEW;
   	END;
    $$ LANGUAGE plpgsql;


    -- trigger
   DROP TRIGGER IF EXISTS update_activity_context ON invasivesbc.activity_incoming_data;
    create trigger update_activity_context AFTER INSERT on invasivesbc.activity_incoming_data FOR EACH ROW
      EXECUTE procedure context_autofill();
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  DROP TRIGGER IF EXISTS update_activity_context ON invasivesbc.activity_incoming_data;

  `);
}
