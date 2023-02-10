import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
  set search_path=invasivesbc,public;

CREATE INDEX if not exists activity_incoming_data_who_type_id_geog_form_status_idx 
ON invasivesbc.activity_incoming_data (updated_by_with_guid,created_by_with_guid,short_id,form_status,
  created_by,geog,activity_subtype,activity_type,activity_id,activity_incoming_data_id);

CREATE INDEX if not exists activity_incoming_data_activity_incoming_data_id_idx 
ON invasivesbc.activity_incoming_data (activity_incoming_data_id,activity_id,short_id);

CREATE INDEX if not exists activity_species_geog_idx 
ON invasivesbc.activity_incoming_data (activity_id,activity_incoming_data_id,activity_type,activity_subtype,
  geog,species_treated,species_positive_full,species_negative_full,species_treated_full,short_id);

CREATE INDEX if not exists activity_incoming_data_payload_idx 
ON invasivesbc.activity_incoming_data 
using GIN (activity_payload);

CREATE INDEX if not exists code_code_id_idx 
ON invasivesbc.code (code_id,code_name,code_sort_order,code_description,code_header_id);

CREATE INDEX if not exists code_header_code_header_id_idx 
ON invasivesbc.code_header (code_header_id,code_category_id,code_header_name,code_header_title,code_header_description);

CREATE INDEX if not exists code_category_code_category_id_idx 
ON invasivesbc.code_category (code_category_id,code_category_name);

CREATE INDEX if not exists iapp_site_summary_and_geojson_site_id_idx 
ON invasivesbc.iapp_site_summary_and_geojson (site_id, all_species_on_site, jurisdictions, 
  all_species_on_site_as_array, site_paper_file_id);


  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    DROP INDEX if exists activity_incoming_data_who_type_id_geog_form_status_idx;
    DROP INDEX if exists activity_incoming_data_activity_incoming_data_id_idx;
    DROP INDEX if exists activity_species_geog_idx;
    DROP INDEX if exists activity_incoming_data_payload_idx;
    DROP INDEX if exists code_code_id_idx;
    DROP INDEX if exists code_header_code_header_id_idx;
    DROP INDEX if exists code_category_code_category_id_idx;
    DROP INDEX if exists iapp_site_summary_and_geojson_site_id_idx;
    
    `);
}
