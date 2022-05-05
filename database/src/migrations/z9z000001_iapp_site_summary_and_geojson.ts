import * as Knex from 'knex';
//For now moving to one consolidated migration for plant reporting.

//Why:  Knex silently failing on view create, making troubleshooting which of the 10+ plant views is failing.
//      Deploying plant views then becomes a process of manually pasting the sql to the db.
//      Having one consolidated file allows for quick troubleshooting and deployments.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  	set search_path=invasivesbc,public;
	
    create materialized view iapp_site_summary_and_geojson as (SELECT
    i.*,
    json_build_object
    (
      'type', 'Feature',
      'properties', json_build_object
      (
        'site_id', i.site_id,
        'species', i.all_species_on_site,
        'has_surveys', i.has_surveys,
        'has_biological_treatments', i.has_biological_treatments,
        'has_biological_monitorings', i.has_biological_treatment_monitorings,
        'has_biological_dispersals', i.has_biological_dispersals,
        'has_chemical_treatments', i.has_chemical_treatments,
        'has_chemical_monitorings', i.has_chemical_treatment_monitorings,
        'has_mechanical_treatments', i.has_mechanical_treatments,
        'has_mechanical_monitorings', i.has_mechanical_treatment_monitorings,
        'earliest_survey', i.min_survey,
        'latest_survey', i.max_survey,
        'earliest_chemical_treatment', i.min_chemical_treatment_dates,
        'latest_chemical_treatment', i.max_chemical_treatment_dates,
        'earliest_chemical_monitoring', i.min_chemical_treatment_monitoring_dates,
        'latest_chemical_monitoring', i.max_chemical_treatment_monitoring_dates,
        'earliest_bio_dispersal', i.min_bio_dispersal_dates,
        'latest_bio_dispersal', i.max_bio_dispersal_dates,
        'earliest_bio_treatment', i.min_bio_treatment_dates,
        'latest_bio_treatment', i.max_bio_treatment_dates,
        'earliest_bio_monitoring', i.min_bio_treatment_monitoring_dates,
        'latest_bio_monitoring', i.max_bio_treatment_monitoring_dates,
        'earliest_mechanical_treatment', i.min_mechanical_treatment_dates,
        'latest_mechanical_treatment', i.max_mechanical_treatment_dates,
        'earliest_mechanical_monitoring', i.min_mechanical_treatment_monitoring_dates,
        'latest_mechanical_monitoring', i.max_mechanical_treatment_monitoring_dates
      ),
      'geometry', public.st_asGeoJSON(s.geog)::jsonb
    ) as "geojson"
  FROM iapp_site_summary i JOIN iapp_spatial s ON i.site_id = s.site_id
  WHERE 1=1);
  
  GRANT SELECT ON iapp_site_summary_and_geojson TO invasivebc;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;
    drop materialized view if exists iapp_site_summary_and_geojson;
  `);
}
