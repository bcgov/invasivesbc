import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;

    DROP MATERIALIZED VIEW IF EXISTS invasivesbc.iapp_site_summary CASCADE;
    
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
          ORDER BY z.site_id, z.survey_date DESC),
        rd_riso AS (SELECT distinct(site_id), regional_district, regional_invasive_species_organization
        FROM invasivesbc.site_selection_extract s
        group by site_id, regional_district, regional_invasive_species_organization
        )
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
              a.agency_agg AS agencies,
              r.regional_district,
              r.regional_invasive_species_organization
            FROM invasivesbc.iapp_site_summary_slow i
              JOIN jurisdiction_data jd ON i.site_id = jd.site_id
              JOIN paper_file_list p ON jd.site_id = p.site_id
              JOIN agencies a ON p.site_id = a.site_id
              JOIN areas z ON a.site_id = z.site_id
              JOIN rd_riso r ON a.site_id = r.site_id
            WHERE 1 = 1
          WITH DATA;
          
         DROP MATERIALIZED VIEW IF EXISTS invasivesbc.iapp_site_summary_and_geojson;
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
              CASE WHEN (i.has_biological_treatment_monitorings OR 
                  i.has_chemical_treatment_monitorings OR
                  i.has_mechanical_treatment_monitorings) 
                THEN 'Yes' 
                ELSE 'No' 
              END AS monitored,
              json_build_object('type', 'Feature', 'properties', json_build_object('site_id', i.site_id, 'species', i.all_species_on_site, 'has_surveys', i.has_surveys, 'has_biological_treatments', i.has_biological_treatments, 'has_biological_monitorings', i.has_biological_treatment_monitorings, 'has_biological_dispersals', i.has_biological_dispersals, 'has_chemical_treatments', i.has_chemical_treatments, 'has_chemical_monitorings', i.has_chemical_treatment_monitorings, 'has_mechanical_treatments', i.has_mechanical_treatments, 'has_mechanical_monitorings', i.has_mechanical_treatment_monitorings, 'earliest_survey', i.min_survey, 'latest_survey', i.max_survey, 'earliest_chemical_treatment', i.min_chemical_treatment_dates, 'latest_chemical_treatment', i.max_chemical_treatment_dates, 'earliest_chemical_monitoring', i.min_chemical_treatment_monitoring_dates, 'latest_chemical_monitoring', i.max_chemical_treatment_monitoring_dates, 'earliest_bio_dispersal', i.min_bio_dispersal_dates, 'latest_bio_dispersal', i.max_bio_dispersal_dates, 'earliest_bio_treatment', i.min_bio_treatment_dates, 'latest_bio_treatment', i.max_bio_treatment_dates, 'earliest_bio_monitoring', i.min_bio_treatment_monitoring_dates, 'latest_bio_monitoring', i.max_bio_treatment_monitoring_dates, 'earliest_mechanical_treatment', i.min_mechanical_treatment_dates, 'latest_mechanical_treatment', i.max_mechanical_treatment_dates, 'earliest_mechanical_monitoring', i.min_mechanical_treatment_monitoring_dates, 'latest_mechanical_monitoring', i.max_mechanical_treatment_monitoring_dates, 'reported_area', i.reported_area, 'jurisdictions', i.jurisdictions, 'regional_district', i.regional_district, 'regional_invasive_species_organization', i.regional_invasive_species_organization), 'geometry', st_asgeojson(s.geog)::jsonb) AS geojson
            FROM invasivesbc.iapp_site_summary i
              JOIN invasivesbc.iapp_spatial s ON i.site_id = s.site_id
            WHERE 1 = 1
          WITH DATA;

          drop index if exists iapp_site_summary_and_geojson_site_id_idx;

          CREATE index if not exists iapp_site_summary_and_geojson_site_id_idx ON invasivesbc.iapp_site_summary_and_geojson 
          USING btree (site_id, site_paper_file_id, jurisdictions, all_species_on_site, 
          max_survey, agencies, has_biological_treatments, has_chemical_treatments,  
          has_mechanical_treatments, has_biological_dispersals, monitored, all_species_on_site_as_array,
          regional_district, regional_invasive_species_organization);
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=invasivesbc,public;

  CREATE OR REPLACE VIEW invasivesbc.iapp_site_summary_slow
      AS WITH sites_grouped AS (
              SELECT site_selection_extract.site_id,
                  site_selection_extract.all_species_on_site,
                  site_selection_extract.decimal_longitude,
                  site_selection_extract.decimal_latitude
                FROM invasivesbc.site_selection_extract
                GROUP BY site_selection_extract.site_id, site_selection_extract.all_species_on_site, site_selection_extract.decimal_longitude, site_selection_extract.decimal_latitude
              ), date_summary AS (
              SELECT sse_1.site_id,
                  min(se.survey_date) AS min_survey,
                  max(se.survey_date) AS max_survey,
                  min(cte.treatment_date) AS min_chemical_treatment_dates,
                  max(cte.treatment_date) AS max_chemical_treatment_dates,
                  min(cme.inspection_date) AS min_chemical_treatment_monitoring_dates,
                  max(cme.inspection_date) AS max_chemical_treatment_monitoring_dates,
                  min(bde.inspection_date) AS min_bio_dispersal_dates,
                  max(bde.inspection_date) AS max_bio_dispersal_dates,
                  min(bte.treatment_date) AS min_bio_treatment_dates,
                  max(bte.treatment_date) AS max_bio_treatment_dates,
                  min(bme.inspection_date) AS min_bio_treatment_monitoring_dates,
                  max(bme.inspection_date) AS max_bio_treatment_monitoring_dates,
                  min(mte.treatment_date) AS min_mechanical_treatment_dates,
                  max(mte.treatment_date) AS max_mechanical_treatment_dates,
                  min(mme.inspection_date) AS min_mechanical_treatment_monitoring_dates,
                  max(mme.inspection_date) AS max_mechanical_treatment_monitoring_dates
                FROM sites_grouped sse_1
                  LEFT JOIN invasivesbc.survey_extract se ON sse_1.site_id = se.site_id
                  LEFT JOIN invasivesbc.chemical_treatment_extract cte ON sse_1.site_id = cte.site_id
                  LEFT JOIN invasivesbc.chemical_monitoring_extract cme ON sse_1.site_id = cme.site_id
                  LEFT JOIN invasivesbc.biological_dispersal_extract bde ON sse_1.site_id = bde.site_id
                  LEFT JOIN invasivesbc.biological_treatment_extract bte ON sse_1.site_id = bte.site_id
                  LEFT JOIN invasivesbc.biological_monitoring_extract bme ON sse_1.site_id = bme.site_id
                  LEFT JOIN invasivesbc.mechanical_treatment_extract mte ON sse_1.site_id = mte.site_id
                  LEFT JOIN invasivesbc.mechanical_monitoring_extract mme ON sse_1.site_id = mme.site_id
                GROUP BY sse_1.site_id
              )
      SELECT sse.site_id,
          sse.all_species_on_site,
          sse.decimal_longitude,
          sse.decimal_latitude,
          ds.min_survey,
          ds.max_survey,
          ds.min_chemical_treatment_dates,
          ds.max_chemical_treatment_dates,
          ds.min_chemical_treatment_monitoring_dates,
          ds.max_chemical_treatment_monitoring_dates,
          ds.min_bio_dispersal_dates,
          ds.max_bio_dispersal_dates,
          ds.min_bio_treatment_dates,
          ds.max_bio_treatment_dates,
          ds.min_bio_treatment_monitoring_dates,
          ds.max_bio_treatment_monitoring_dates,
          ds.min_mechanical_treatment_dates,
          ds.max_mechanical_treatment_dates,
          ds.min_mechanical_treatment_monitoring_dates,
          ds.max_mechanical_treatment_monitoring_dates,
              CASE
                  WHEN ds.min_survey IS NULL THEN false
                  ELSE true
              END AS has_surveys,
              CASE
                  WHEN ds.max_bio_treatment_monitoring_dates IS NULL THEN false
                  ELSE true
              END AS has_biological_treatment_monitorings,
              CASE
                  WHEN ds.max_bio_treatment_dates IS NULL THEN false
                  ELSE true
              END AS has_biological_treatments,
              CASE
                  WHEN ds.min_bio_dispersal_dates IS NULL THEN false
                  ELSE true
              END AS has_biological_dispersals,
              CASE
                  WHEN ds.max_chemical_treatment_monitoring_dates IS NULL THEN false
                  ELSE true
              END AS has_chemical_treatment_monitorings,
              CASE
                  WHEN ds.min_chemical_treatment_dates IS NULL THEN false
                  ELSE true
              END AS has_chemical_treatments,
              CASE
                  WHEN ds.max_mechanical_treatment_dates IS NULL THEN false
                  ELSE true
              END AS has_mechanical_treatments,
              CASE
                  WHEN ds.max_mechanical_treatment_monitoring_dates IS NULL THEN false
                  ELSE true
              END AS has_mechanical_treatment_monitorings
        FROM sites_grouped sse
          JOIN date_summary ds ON ds.site_id = sse.site_id;
  
         DROP MATERIALIZED VIEW IF EXISTS invasivesbc.iapp_site_summary CASCADE;
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
            a.agency_agg AS agencies,
            r.regional_districts
          FROM invasivesbc.iapp_site_summary_slow i
            JOIN jurisdiction_data jd ON i.site_id = jd.site_id
            JOIN paper_file_list p ON jd.site_id = p.site_id
            JOIN agencies a ON p.site_id = a.site_id
            JOIN areas z ON a.site_id = z.site_id
          WHERE 1 = 1
        WITH DATA;
        
       DROP MATERIALIZED VIEW IF EXISTS invasivesbc.iapp_site_summary_and_geojson;
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
            CASE WHEN (i.has_biological_treatment_monitorings OR 
                i.has_chemical_treatment_monitorings OR
                i.has_mechanical_treatment_monitorings) 
              THEN 'Yes' 
              ELSE 'No' 
            END AS monitored,
            json_build_object('type', 'Feature', 'properties', json_build_object('site_id', i.site_id, 'species', i.all_species_on_site, 'has_surveys', i.has_surveys, 'has_biological_treatments', i.has_biological_treatments, 'has_biological_monitorings', i.has_biological_treatment_monitorings, 'has_biological_dispersals', i.has_biological_dispersals, 'has_chemical_treatments', i.has_chemical_treatments, 'has_chemical_monitorings', i.has_chemical_treatment_monitorings, 'has_mechanical_treatments', i.has_mechanical_treatments, 'has_mechanical_monitorings', i.has_mechanical_treatment_monitorings, 'earliest_survey', i.min_survey, 'latest_survey', i.max_survey, 'earliest_chemical_treatment', i.min_chemical_treatment_dates, 'latest_chemical_treatment', i.max_chemical_treatment_dates, 'earliest_chemical_monitoring', i.min_chemical_treatment_monitoring_dates, 'latest_chemical_monitoring', i.max_chemical_treatment_monitoring_dates, 'earliest_bio_dispersal', i.min_bio_dispersal_dates, 'latest_bio_dispersal', i.max_bio_dispersal_dates, 'earliest_bio_treatment', i.min_bio_treatment_dates, 'latest_bio_treatment', i.max_bio_treatment_dates, 'earliest_bio_monitoring', i.min_bio_treatment_monitoring_dates, 'latest_bio_monitoring', i.max_bio_treatment_monitoring_dates, 'earliest_mechanical_treatment', i.min_mechanical_treatment_dates, 'latest_mechanical_treatment', i.max_mechanical_treatment_dates, 'earliest_mechanical_monitoring', i.min_mechanical_treatment_monitoring_dates, 'latest_mechanical_monitoring', i.max_mechanical_treatment_monitoring_dates, 'reported_area', i.reported_area, 'jurisdictions', i.jurisdictions), 'geometry', st_asgeojson(s.geog)::jsonb) AS geojson
          FROM invasivesbc.iapp_site_summary i
            JOIN invasivesbc.iapp_spatial s ON i.site_id = s.site_id
          WHERE 1 = 1
        WITH DATA;

  `);
}
