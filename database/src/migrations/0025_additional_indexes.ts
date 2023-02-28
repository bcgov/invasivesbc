import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
  set search_path=invasivesbc,public;

  CREATE INDEX IF NOT EXISTS survey_extract_site_id_idx ON invasivesbc.survey_extract (site_id);

  CREATE INDEX IF NOT EXISTS site_id_summary ON invasivesbc.iapp_site_summary_and_geojson USING btree (site_id);
  CREATE INDEX IF NOT EXISTS species_on_site ON invasivesbc.iapp_site_summary_and_geojson USING btree (all_species_on_site);
  CREATE INDEX IF NOT EXISTS code_code_name_idx ON invasivesbc.code (code_name);
  
  CREATE INDEX IF NOT EXISTS code_header_code_header_name_idx ON invasivesbc.code_header (code_header_name);
  
  CREATE INDEX IF NOT EXISTS site_selection_extract_site_id_idx ON invasivesbc.site_selection_extract (site_id);
  CREATE INDEX IF NOT EXISTS chemical_treatment_extract_site_id_idx ON invasivesbc.chemical_treatment_extract (site_id);
  CREATE INDEX IF NOT EXISTS mechanical_monitoring_extract_site_id_idx ON invasivesbc.mechanical_monitoring_extract (site_id);
  CREATE INDEX IF NOT EXISTS mechanical_treatment_extract_site_id_idx ON invasivesbc.mechanical_treatment_extract (site_id);
  CREATE INDEX IF NOT EXISTS biological_dispersal_extract_site_id_idx ON invasivesbc.biological_dispersal_extract (site_id);
  CREATE INDEX IF NOT EXISTS biological_monitoring_extract_site_id_idx ON invasivesbc.biological_monitoring_extract (site_id);
  CREATE INDEX IF NOT EXISTS biological_treatment_extract_site_id_idx ON invasivesbc.biological_treatment_extract USING btree (site_id);
  CREATE INDEX IF NOT EXISTS code_code_description_idx ON invasivesbc.code (code_description);
  
  CREATE INDEX IF NOT EXISTS user_role_metabase_group_idx ON invasivesbc.user_role (metabase_group);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    DROP INDEX if exists survey_extract_site_id_idx;
    DROP INDEX if exists site_id_summary;
    DROP INDEX if exists species_on_site;
    DROP INDEX if exists code_code_name_idx;
    DROP INDEX if exists code_header_code_header_name_idx;
    DROP INDEX if exists site_selection_extract_site_id_idx;
    DROP INDEX if exists chemical_treatment_extract_site_id_idx;
    DROP INDEX if exists mechanical_monitoring_extract_site_id_idx;
    DROP INDEX if exists mechanical_treatment_extract_site_id_idx;
    DROP INDEX if exists biological_dispersal_extract_site_id_idx;
    DROP INDEX if exists biological_monitoring_extract_site_id_idx;
    DROP INDEX if exists biological_treatment_extract_site_id_idx;
    DROP INDEX if exists code_code_description_idx;
    DROP INDEX if exists user_role_metabase_group_idx;
    `);
}
