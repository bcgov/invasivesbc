import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  const sql = `
      set schema 'invasivesbc';
      set search_path = invasivesbc,public;
      DROP MATERIALIZED VIEW IF EXISTS iapp_site_summary_and_geojson;
      DROP MATERIALIZED VIEW IF EXISTS iapp_site_summary;
      CREATE MATERIALIZED VIEW iapp_site_summary
      AS (
        WITH jurisdiction_data
        AS (
          SELECT DISTINCT (
              Regexp_split_to_array(jurisdictions, '(?<=\)(, )')
            ) AS jurisdictions,
            estimated_area_hectares, 
            site_id
          FROM survey_extract)
        SELECT 
          i.site_id,
          all_species_on_site,
          decimal_longitude,
          decimal_latitude,
          min_survey,
          max_survey,
          min_chemical_treatment_dates,
          max_chemical_treatment_dates,
          min_chemical_treatment_monitoring_dates,
          max_chemical_treatment_monitoring_dates,
          min_bio_dispersal_dates,
          max_bio_dispersal_dates,
          min_bio_treatment_dates,
          max_bio_treatment_dates,
          min_bio_treatment_monitoring_dates,
          max_bio_treatment_monitoring_dates,
          min_mechanical_treatment_dates,
          max_mechanical_treatment_dates,
          min_mechanical_treatment_monitoring_dates,
          max_mechanical_treatment_monitoring_dates,
          has_surveys,
          has_biological_treatment_monitorings,
          has_biological_treatments,
          has_biological_dispersals,
          has_chemical_treatment_monitorings,
          has_chemical_treatments,
          has_mechanical_treatments,
          has_mechanical_treatment_monitorings,
          jd.jurisdictions,
          jd.estimated_area_hectares AS reported_area,
          String_to_array(all_species_on_site, ', ') AS
          all_species_on_site_as_array
        FROM iapp_site_summary_slow i
        JOIN jurisdiction_data jd
        ON i.site_id = jd.site_id
        WHERE 1=1
      );
      GRANT SELECT ON iapp_site_summary TO invasivebc;
      REFRESH MATERIALIZED VIEW iapp_site_summary;
      CREATE MATERIALIZED VIEW iapp_site_summary_and_geojson
      AS (
        SELECT
          i.*,
          json_build_object (
            'type', 'Feature',
            'properties', json_build_object (
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
              'latest_mechanical_monitoring', i.max_mechanical_treatment_monitoring_dates,
              'reported_area', i.reported_area,
              'jurisdictions', i.jurisdictions
            ),
            'geometry', public.st_asGeoJSON(s.geog)::jsonb
          ) as "geojson"
        FROM iapp_site_summary i
        JOIN iapp_spatial s
        ON i.site_id = s.site_id
        WHERE 1=1
      );
      GRANT SELECT ON iapp_site_summary_and_geojson TO invasivebc;
      REFRESH MATERIALIZED VIEW iapp_site_summary_and_geojson;
    `;
  // try {
    await knex.raw(sql);
  // } catch (e) {
  //   console.log('Error creating iapp_site_summary or iapp_site_summary_and_geojson');
  // }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const sql = `
      SET schema '${DB_SCHEMA}';
      SET search_path = ${DB_SCHEMA},public;
      
      DROP MATERIALIZED VIEW IF EXISTS invasivesbc.iapp_site_summary_and_geojson;
      DROP MATERIALIZED VIEW IF EXISTS invasivesbc.iapp_site_summary;
    `

    await knex.raw(sql);
  } catch (e) {
    console.log('Error deleting iapp_site_summary or iapp_site_summary_and_geojson', e);
  }
}