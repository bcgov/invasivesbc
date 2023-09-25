import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set 
  search_path = invasivesbc, 
  public;
  -- invasivesbc.iapp_site_summary_and_geojson source

  drop MATERIALIZED view invasivesbc.iapp_site_summary_and_geojson;
  CREATE MATERIALIZED VIEW invasivesbc.iapp_site_summary_and_geojson
  TABLESPACE pg_default
  AS SELECT i.site_id,
      i.all_species_on_site,
      i.decimal_longitude,
      i.decimal_latitude,
      i.min_survey,
      i.max_survey,
      i.min_chemical_treatment_dates,
      i.max_chemical_treatment_dates,
      i.min_chemical_treatment_monitoring_dates,
      i.max_chemical_treatment_monitoring_dates,
      i.min_bio_dispersal_dates,
      i.max_bio_dispersal_dates,
      i.min_bio_treatment_dates,
      i.max_bio_treatment_dates,
      i.min_bio_treatment_monitoring_dates,
      i.max_bio_treatment_monitoring_dates,
      i.min_mechanical_treatment_dates,
      i.max_mechanical_treatment_dates,
      i.min_mechanical_treatment_monitoring_dates,
      i.max_mechanical_treatment_monitoring_dates,
      i.has_surveys,
      i.has_biological_treatment_monitorings,
      i.has_biological_treatments,
      i.has_biological_dispersals,
      i.has_chemical_treatment_monitorings,
      i.has_chemical_treatments,
      i.has_mechanical_treatments,
      i.has_mechanical_treatment_monitorings,
      i.jurisdictions,
      i.reported_area,
      i.all_species_on_site_as_array,
      i.site_paper_file_id,
      i.agencies,
      i.regional_district,
      i.regional_invasive_species_organization,
      s.geog,
          CASE
              WHEN i.has_biological_treatment_monitorings OR i.has_chemical_treatment_monitorings OR i.has_mechanical_treatment_monitorings THEN 'Yes'::text
              ELSE 'No'::text
          END AS monitored,
      json_build_object('type', 'Feature', 'properties', json_build_object('site_id', i.site_id, 'species', i.all_species_on_site, 'has_surveys', i.has_surveys, 'has_biological_treatments', i.has_biological_treatments, 'has_biological_monitorings', i.has_biological_treatment_monitorings, 'has_biological_dispersals', i.has_biological_dispersals, 'has_chemical_treatments', i.has_chemical_treatments, 'has_chemical_monitorings', i.has_chemical_treatment_monitorings, 'has_mechanical_treatments', i.has_mechanical_treatments, 'has_mechanical_monitorings', i.has_mechanical_treatment_monitorings, 'earliest_survey', i.min_survey, 'latest_survey', i.max_survey, 'earliest_chemical_treatment', i.min_chemical_treatment_dates, 'latest_chemical_treatment', i.max_chemical_treatment_dates, 'earliest_chemical_monitoring', i.min_chemical_treatment_monitoring_dates, 'latest_chemical_monitoring', i.max_chemical_treatment_monitoring_dates, 'earliest_bio_dispersal', i.min_bio_dispersal_dates, 'latest_bio_dispersal', i.max_bio_dispersal_dates, 'earliest_bio_treatment', i.min_bio_treatment_dates, 'latest_bio_treatment', i.max_bio_treatment_dates, 'earliest_bio_monitoring', i.min_bio_treatment_monitoring_dates, 'latest_bio_monitoring', i.max_bio_treatment_monitoring_dates, 'earliest_mechanical_treatment', i.min_mechanical_treatment_dates, 'latest_mechanical_treatment', i.max_mechanical_treatment_dates, 'earliest_mechanical_monitoring', i.min_mechanical_treatment_monitoring_dates, 'latest_mechanical_monitoring', i.max_mechanical_treatment_monitoring_dates, 'reported_area', i.reported_area, 'jurisdictions', i.jurisdictions, 'regional_district', i.regional_district, 'regional_invasive_species_organization', i.regional_invasive_species_organization), 'geometry', st_asgeojson(s.geog)::jsonb) AS geojson
     FROM invasivesbc.iapp_site_summary i
       JOIN invasivesbc.iapp_spatial s ON i.site_id = s.site_id
    WHERE 1 = 1
  WITH DATA;
  
  -- View indexes:
  CREATE INDEX iapp_site_summary_and_geojson_site_id_idx ON invasivesbc.iapp_site_summary_and_geojson USING btree (site_id, site_paper_file_id, jurisdictions, all_species_on_site, max_survey, agencies, has_biological_treatments, has_chemical_treatments, has_mechanical_treatments, has_biological_dispersals, monitored, all_species_on_site_as_array, regional_district, regional_invasive_species_organization);
  -- View indexes:
  CREATE INDEX iapp_site_summary_and_geojson_geom_idx
  ON invasivesbc.iapp_site_summary_and_geojson
  USING GIST (geog);    
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  `);
}
