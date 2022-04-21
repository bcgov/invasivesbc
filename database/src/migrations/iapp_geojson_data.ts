import * as Knex from 'knex';
//For now moving to one consolidated migration for plant reporting.

//Why:  Knex silently failing on view create, making troubleshooting which of the 10+ plant views is failing.
//      Deploying plant views then becomes a process of manually pasting the sql to the db.
//      Having one consolidated file allows for quick troubleshooting and deployments.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  	set search_path=invasivesbc,public;
    
	set search_path=invasivesbc,public;
	
	drop materialized view if exists iapp_geojson_data;
	create materialized view iapp_geojson_data as SELECT
  jsonb_build_object (
    'type', 'Feature',
    'properties', json_build_object(
      'point_of_interest_id', point_of_interest_id,
      'point_of_interest_type', point_of_interest_type,
      'point_of_interest_subtype', point_of_interest_subtype
    ),
    'geometry', public.st_asGeoJSON(geog)::jsonb
  ) as "geojson",
  COUNT(*) OVER() AS "total_rows_count"
 FROM point_of_interest_incoming_data WHERE 1 = 1 LIMIT 150000;

	GRANT SELECT ON iapp_geojson_data  TO invasivebc;


  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=invasivesbc,public;
drop materialized view if exists iapp_geojson_data;
`);
}
