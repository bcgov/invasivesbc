import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path = invasivesbc,public;

    drop index if exists iapp_site_summary_and_geojson_site_id_idx;
    drop index if exists admindefinedshapes_spatial_idx;
    
    CREATE index if not exists iapp_site_summary_and_geojson_site_id_idx ON invasivesbc.iapp_site_summary_and_geojson 
    USING btree (site_id, site_paper_file_id, jurisdictions, all_species_on_site, 
    max_survey, agencies, has_biological_treatments, has_chemical_treatments,  
    has_mechanical_treatments, has_biological_dispersals, monitored, all_species_on_site_as_array);
    
    CREATE index if not exists point_of_interest_biological_dispersal_date_idx 
    ON invasivesbc.point_of_interest_incoming_data 
    USING btree (invasivesbc.immutable_to_date(((((point_of_interest_payload -> 'form_data'::text) -> 'biological_dispersals'::text) -> 'monitoring_date'::text))::text));
    
    CREATE index if not exists point_of_interest_biological_treatment_date_idx 
    ON invasivesbc.point_of_interest_incoming_data 
    USING btree (invasivesbc.immutable_to_date(((((point_of_interest_payload -> 'form_data'::text) -> 'biological_treatments'::text) -> 'treatment_date'::text))::text)); 
    
    CREATE index if not exists point_of_interest_biological_treatment_monitoring_date_idx 
    ON invasivesbc.point_of_interest_incoming_data 
    USING btree (invasivesbc.immutable_to_date((((((point_of_interest_payload -> 'form_data'::text) -> 'biological_treatments'::text) -> 'monitoring'::text) -> 'monitoring_date'::text))::text));
    
    CREATE index if not exists point_of_interest_chemical_monitoring_date_idx 
    ON invasivesbc.point_of_interest_incoming_data 
    USING btree (invasivesbc.immutable_to_date((((((point_of_interest_payload -> 'form_data'::text) -> 'chemical_treatments'::text) -> 'monitoring'::text) -> 'monitoring_date'::text))::text));
    
    CREATE index if not exists point_of_interest_chemical_treatment_date_idx 
    ON invasivesbc.point_of_interest_incoming_data 
    USING btree (invasivesbc.immutable_to_date(((((point_of_interest_payload -> 'form_data'::text) -> 'chemical_treatments'::text) -> 'treatment_date'::text))::text));
    
    CREATE index if not exists point_of_interest_id_idx 
    ON invasivesbc.point_of_interest_incoming_data 
    USING btree (point_of_interest_id);
    
    CREATE index if not exists point_of_interest_mechanical_treatment_date_idx 
    ON invasivesbc.point_of_interest_incoming_data 
    USING btree (invasivesbc.immutable_to_date(((((point_of_interest_payload -> 'form_data'::text) -> 'mechanical_treatments'::text) -> 'treatment_date'::text))::text));
    
    CREATE index if not exists point_of_interest_mechanical_treatment_monitoring_date_idx 
    ON invasivesbc.point_of_interest_incoming_data 
    USING btree (invasivesbc.immutable_to_date((((((point_of_interest_payload -> 'form_data'::text) -> 'mechanical_treatments'::text) -> 'monitoring'::text) -> 'monitoring_date'::text))::text));
    
    CREATE index if not exists point_of_interest_survey_date_idx 
    ON invasivesbc.point_of_interest_incoming_data 
    USING btree (invasivesbc.immutable_to_date(((((point_of_interest_payload -> 'form_data'::text) -> 'surveys'::text) -> 'survey_date'::text))::text));
    
    CREATE index if not exists admin_defined_shapes_geog_idx 
    ON invasivesbc.admin_defined_shapes USING gist (geog);
    
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = invasivesbc,public;

    drop index if exists iapp_site_summary_and_geojson_site_id_idx;
    drop index if exists point_of_interest_biological_dispersal_date_idx;
    drop index if exists point_of_interest_biological_treatment_date_idx;
    drop index if exists point_of_interest_biological_treatment_monitoring_date_idx;
    drop index if exists point_of_interest_chemical_monitoring_date_idx;
    drop index if exists point_of_interest_chemical_treatment_date_idx;
    drop index if exists point_of_interest_id_idx;
    drop index if exists point_of_interest_mechanical_treatment_date_idx;
    drop index if exists point_of_interest_mechanical_treatment_monitoring_date_idx;
    drop index if exists point_of_interest_survey_date_idx;
    drop index if exists admin_defined_shapes_geog_idx;

  `);
}
