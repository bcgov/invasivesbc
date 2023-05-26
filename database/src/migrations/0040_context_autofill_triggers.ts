import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    -function for trigger
    CREATE OR REPLACE FUNCTION context_autofill() RETURNS TRIGGER AS $$
    BEGIN
        UPDATE invasivesbc.activity_incoming_data 
        SET invasive_plant_management_areas = (
	        select
		      target.ipma target
		    from
		      public.invasive_plant_management_areas target
		    where
		      public.st_intersects(
		        public.st_geographyFromText(('POINT('::TEXT || (activity_payload->'form_data'->'activity_data'->>'latitude')::TEXT  || ' '::TEXT || (activity_payload->'form_data'->'activity_data'->>'latitude')::TEXT || ')'::TEXT)::TEXT),
		        target.geog
		      )
	    ),
	    regional_invasive_species_organization_areas = (
	        select
		      target.agency target
		    from
		      public.regional_invasive_species_organization_areas target
		    where
		      public.st_intersects(
		        public.st_geographyFromText(('POINT('::TEXT || (activity_payload->'form_data'->'activity_data'->>'latitude')::TEXT || ' '::TEXT || (activity_payload->'form_data'->'activity_data'->>'latitude')::TEXT || ')'::TEXT)::TEXT),
		        target.geog
		      )
	    )	    
        WHERE activity_incoming_data_id  =  new.activity_incoming_data_id;
        
        RETURN NEW;
   	END;
    $$ LANGUAGE plpgsql;


    -- trigger
    create trigger update_activity_context AFTER INSERT on invasivesbc.activity_incoming_data
      EXECUTE procedure context_autofill();
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    

  `);
}
