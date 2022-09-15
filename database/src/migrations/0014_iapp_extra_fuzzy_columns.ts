import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Creates columns for jurisdiction and species, recalls Brian's ...02 migration, then creates/fills iapp_invbc_mapping mapping table
  await knex.raw(`
  	set search_path=invasivesbc,public;

    drop materialized VIEW IF EXISTS invasivesbc.iapp_site_summary_and_geojson;
    drop materialized view IF EXISTS invasivesbc.iapp_site_summary;

    CREATE MATERIALIZED VIEW invasivesbc.iapp_site_summary
      TABLESPACE pg_default
      AS WITH jurisdiction_data AS (
              SELECT DISTINCT regexp_split_to_array(survey_extract.jurisdictions::text, '($1<=)(, )'::text) AS jurisdictions,
                  survey_extract.site_id
                FROM invasivesbc.survey_extract
              ),
      paper_file_list AS (SELECT DISTINCT(se.site_paper_file_id), se.site_id 
	  	FROM survey_extract se 
	  	GROUP BY se.site_id, se.site_paper_file_id),
	  agencies AS (SELECT sea.site_id, string_agg(DISTINCT(sea.survey_agency), ', ') AS agency_agg
	  	FROM survey_extract sea 
	  	GROUP BY sea.site_id),
	  areas AS (SELECT DISTINCT ON(z.site_id) z.site_id, z.estimated_area_hectares, z.survey_date 
	    FROM invasivesbc.survey_extract z
	    ORDER BY z.site_id, z.survey_date DESC)
      SELECT i.site_id,
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
          jd.jurisdictions,
          z.estimated_area_hectares AS reported_area,
          string_to_array(i.all_species_on_site::text, ', '::text) AS all_species_on_site_as_array,
          p.site_paper_file_id,
          a.agency_agg AS agencies
        FROM invasivesbc.iapp_site_summary_slow i
          JOIN jurisdiction_data jd ON i.site_id = jd.site_id
          JOIN paper_file_list p ON jd.site_id = p.site_id
          JOIN agencies a ON p.site_id = a.site_id
          JOIN areas z ON a.site_id = z.site_id
        WHERE 1 = 1
      WITH DATA;
      
      
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
          json_build_object('type', 'Feature', 'properties', json_build_object('site_id', i.site_id, 'species', i.all_species_on_site, 'has_surveys', i.has_surveys, 'has_biological_treatments', i.has_biological_treatments, 'has_biological_monitorings', i.has_biological_treatment_monitorings, 'has_biological_dispersals', i.has_biological_dispersals, 'has_chemical_treatments', i.has_chemical_treatments, 'has_chemical_monitorings', i.has_chemical_treatment_monitorings, 'has_mechanical_treatments', i.has_mechanical_treatments, 'has_mechanical_monitorings', i.has_mechanical_treatment_monitorings, 'earliest_survey', i.min_survey, 'latest_survey', i.max_survey, 'earliest_chemical_treatment', i.min_chemical_treatment_dates, 'latest_chemical_treatment', i.max_chemical_treatment_dates, 'earliest_chemical_monitoring', i.min_chemical_treatment_monitoring_dates, 'latest_chemical_monitoring', i.max_chemical_treatment_monitoring_dates, 'earliest_bio_dispersal', i.min_bio_dispersal_dates, 'latest_bio_dispersal', i.max_bio_dispersal_dates, 'earliest_bio_treatment', i.min_bio_treatment_dates, 'latest_bio_treatment', i.max_bio_treatment_dates, 'earliest_bio_monitoring', i.min_bio_treatment_monitoring_dates, 'latest_bio_monitoring', i.max_bio_treatment_monitoring_dates, 'earliest_mechanical_treatment', i.min_mechanical_treatment_dates, 'latest_mechanical_treatment', i.max_mechanical_treatment_dates, 'earliest_mechanical_monitoring', i.min_mechanical_treatment_monitoring_dates, 'latest_mechanical_monitoring', i.max_mechanical_treatment_monitoring_dates, 'reported_area', i.reported_area, 'jurisdictions', i.jurisdictions), 'geometry', st_asgeojson(s.geog)::jsonb) AS geojson
        FROM invasivesbc.iapp_site_summary i
          JOIN invasivesbc.iapp_spatial s ON i.site_id = s.site_id
        WHERE 1 = 1
      WITH DATA;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;
    drop materialized view invasivesbc.iapp_site_summary_and_geojson;
    drop materialized view invasivesbc.iapp_site_summary;
    `);
}
