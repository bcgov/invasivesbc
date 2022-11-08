import {Knex} from 'knex';

export async function up(knex: Knex) {

  // included in the large block below

  let legacyFunctionDef;

  if (
    process.env['SKIP_POSTGRES9_COMPATIBILITY'] !== undefined &&
    process.env['SKIP_POSTGRES9_COMPATIBILITY'].toLowerCase() === 'true'
  ) {
    legacyFunctionDef = `-- ommitted legacy function def`;
  } else {
    legacyFunctionDef = `CREATE or replace  FUNCTION public.convert_string_list_to_array_elements(unknown) RETURNS TABLE(f1 text)
      AS $$ SELECT unnest(('{' || $1::text || '}')::text[]); $$
      LANGUAGE SQL;`;
  }

  try {
    await knex.raw(`
    -- Permissions

    -- DROP SCHEMA invasivesbc;

    CREATE SCHEMA invasivesbc AUTHORIZATION invasivebc;

    -- DROP TYPE invasivesbc."batch_upload_status";

    CREATE TYPE invasivesbc."batch_upload_status" AS ENUM (
      'NEW',
      'PROCESSING',
      'ERROR',
      'SUCCESS');

    -- DROP TYPE invasivesbc."embedded_metabase_resource_type";

    CREATE TYPE invasivesbc."embedded_metabase_resource_type" AS ENUM (
      'dashboard',
      'question');

    -- DROP TYPE invasivesbc."validation_status";

    CREATE TYPE invasivesbc."validation_status" AS ENUM (
      'VALID',
      'INVALID');

    -- DROP SEQUENCE invasivesbc.access_request_access_request_id_seq;

    CREATE SEQUENCE invasivesbc.access_request_access_request_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.access_request_access_request_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.access_request_access_request_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.activity_incoming_data_activity_incoming_data_id_seq;

    CREATE SEQUENCE invasivesbc.activity_incoming_data_activity_incoming_data_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.activity_incoming_data_activity_incoming_data_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.activity_incoming_data_activity_incoming_data_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.admin_defined_shapes_id_seq;

    CREATE SEQUENCE invasivesbc.admin_defined_shapes_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.admin_defined_shapes_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.admin_defined_shapes_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.application_user_user_id_seq;

    CREATE SEQUENCE invasivesbc.application_user_user_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.application_user_user_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.application_user_user_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.batch_uploads_id_seq;

    CREATE SEQUENCE invasivesbc.batch_uploads_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.batch_uploads_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.batch_uploads_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.bc_small_grid_id_seq;

    CREATE SEQUENCE invasivesbc.bc_small_grid_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.bc_small_grid_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.bc_small_grid_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.biological_dispersal_extract_biologicaldispersalid_seq;

    CREATE SEQUENCE invasivesbc.biological_dispersal_extract_biologicaldispersalid_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.biological_dispersal_extract_biologicaldispersalid_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.biological_dispersal_extract_biologicaldispersalid_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.biological_monitoring_extract_biologicalmonitoringid_seq;

    CREATE SEQUENCE invasivesbc.biological_monitoring_extract_biologicalmonitoringid_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.biological_monitoring_extract_biologicalmonitoringid_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.biological_monitoring_extract_biologicalmonitoringid_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.biological_treatment_extract_biotreatmentid_seq;

    CREATE SEQUENCE invasivesbc.biological_treatment_extract_biotreatmentid_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.biological_treatment_extract_biotreatmentid_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.biological_treatment_extract_biotreatmentid_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.chemical_monitoring_extract_chemicalmonitoringid_seq;

    CREATE SEQUENCE invasivesbc.chemical_monitoring_extract_chemicalmonitoringid_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.chemical_monitoring_extract_chemicalmonitoringid_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.chemical_monitoring_extract_chemicalmonitoringid_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.chemical_treatment_extract_chemicaltreatmentid_seq;

    CREATE SEQUENCE invasivesbc.chemical_treatment_extract_chemicaltreatmentid_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.chemical_treatment_extract_chemicaltreatmentid_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.chemical_treatment_extract_chemicaltreatmentid_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.code_category_code_category_id_seq;

    CREATE SEQUENCE invasivesbc.code_category_code_category_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.code_category_code_category_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.code_category_code_category_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.code_code_id_seq;

    CREATE SEQUENCE invasivesbc.code_code_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.code_code_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.code_code_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.code_header_code_header_id_seq;

    CREATE SEQUENCE invasivesbc.code_header_code_header_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.code_header_code_header_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.code_header_code_header_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.embedded_report_categories_id_seq;

    CREATE SEQUENCE invasivesbc.embedded_report_categories_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.embedded_report_categories_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.embedded_report_categories_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.embedded_reports_id_seq;

    CREATE SEQUENCE invasivesbc.embedded_reports_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 10000;

    -- Permissions

    ALTER SEQUENCE invasivesbc.embedded_reports_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.embedded_reports_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.iapp_invbc_mapping_mapping_id_seq;

    CREATE SEQUENCE invasivesbc.iapp_invbc_mapping_mapping_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.iapp_invbc_mapping_mapping_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.iapp_invbc_mapping_mapping_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.iapp_jurisdictions_id_seq;

    CREATE SEQUENCE invasivesbc.iapp_jurisdictions_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.iapp_jurisdictions_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.iapp_jurisdictions_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.invasive_plant_no_treatment_extr_invasiveplantnotreatmentid_seq;

    CREATE SEQUENCE invasivesbc.invasive_plant_no_treatment_extr_invasiveplantnotreatmentid_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.invasive_plant_no_treatment_extr_invasiveplantnotreatmentid_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.invasive_plant_no_treatment_extr_invasiveplantnotreatmentid_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.mechanical_monitoring_extract_mechmonitoringid_seq;

    CREATE SEQUENCE invasivesbc.mechanical_monitoring_extract_mechmonitoringid_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.mechanical_monitoring_extract_mechmonitoringid_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.mechanical_monitoring_extract_mechmonitoringid_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.mechanical_treatment_extract_mechanicaltreatmentid_seq;

    CREATE SEQUENCE invasivesbc.mechanical_treatment_extract_mechanicaltreatmentid_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.mechanical_treatment_extract_mechanicaltreatmentid_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.mechanical_treatment_extract_mechanicaltreatmentid_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.planning_extract_planningid_seq;

    CREATE SEQUENCE invasivesbc.planning_extract_planningid_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.planning_extract_planningid_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.planning_extract_planningid_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.point_of_interest_incoming_da_point_of_interest_incoming_da_seq;

    CREATE SEQUENCE invasivesbc.point_of_interest_incoming_da_point_of_interest_incoming_da_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.point_of_interest_incoming_da_point_of_interest_incoming_da_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.point_of_interest_incoming_da_point_of_interest_incoming_da_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.point_of_interest_incoming_data_point_of_interest_id_seq;

    CREATE SEQUENCE invasivesbc.point_of_interest_incoming_data_point_of_interest_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.point_of_interest_incoming_data_point_of_interest_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.point_of_interest_incoming_data_point_of_interest_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.site_selection_extract_siteselectionid_seq;

    CREATE SEQUENCE invasivesbc.site_selection_extract_siteselectionid_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.site_selection_extract_siteselectionid_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.site_selection_extract_siteselectionid_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.species_ref_raw_species_id_seq;

    CREATE SEQUENCE invasivesbc.species_ref_raw_species_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.species_ref_raw_species_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.species_ref_raw_species_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.survey_extract_surveyid_seq;

    CREATE SEQUENCE invasivesbc.survey_extract_surveyid_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.survey_extract_surveyid_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.survey_extract_surveyid_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.user_access_access_id_seq;

    CREATE SEQUENCE invasivesbc.user_access_access_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.user_access_access_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.user_access_access_id_seq TO invasivebc;

    -- DROP SEQUENCE invasivesbc.user_role_role_id_seq;

    CREATE SEQUENCE invasivesbc.user_role_role_id_seq
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      START 1;

    -- Permissions

    ALTER SEQUENCE invasivesbc.user_role_role_id_seq OWNER TO invasivebc;
    GRANT ALL ON SEQUENCE invasivesbc.user_role_role_id_seq TO invasivebc;
    -- invasivesbc.access_request definition

    -- Drop table

    -- DROP TABLE invasivesbc.access_request;

    CREATE TABLE invasivesbc.access_request (
      access_request_id serial4 NOT NULL,
      idir_account_name varchar(100) NULL,
      bceid_account_name varchar(100) NULL,
      first_name varchar(50) NOT NULL,
      last_name varchar(50) NOT NULL,
      primary_email varchar(100) NOT NULL,
      work_phone_number varchar(25) NULL,
      funding_agencies varchar(1000) NULL,
      pac_number varchar(100) NULL,
      employer varchar(100) NULL,
      pac_service_number_1 varchar(1000) NULL,
      pac_service_number_2 varchar(1000) NULL,
      "comments" varchar(1000) NULL,
      status varchar(100) NOT NULL DEFAULT 'Awaiting Approval'::character varying,
      requested_roles varchar(1000) NULL,
      idir_userid varchar(100) NULL,
      bceid_userid varchar(100) NULL,
      created_at timestamp NULL DEFAULT now(),
      updated_at timestamp NULL DEFAULT now(),
      request_type varchar(15) NULL DEFAULT 'ACCESS'::character varying,
      CONSTRAINT access_request_idir_userid_bceid_userid_key UNIQUE (idir_userid, bceid_userid),
      CONSTRAINT access_request_pkey PRIMARY KEY (access_request_id)
    );

    -- Permissions

    ALTER TABLE invasivesbc.access_request OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.access_request TO invasivebc;


    -- invasivesbc.activity_incoming_data definition

    -- Drop table

    -- DROP TABLE invasivesbc.activity_incoming_data;

    CREATE TABLE invasivesbc.activity_incoming_data (
      activity_incoming_data_id serial4 NOT NULL,
      activity_id uuid NULL,
      "version" int4 NULL,
      activity_type varchar(200) NULL,
      activity_subtype varchar(200) NULL,
      created_timestamp timestamp NOT NULL DEFAULT now(),
      received_timestamp timestamp NOT NULL DEFAULT now(),
      deleted_timestamp timestamp NULL,
      geom public.geometry(geometry, 3005) NULL,
      geog public.geography(geometry, 4326) NULL,
      media_keys _text NULL,
      activity_payload jsonb NULL,
      biogeoclimatic_zones varchar(30) NULL,
      regional_invasive_species_organization_areas varchar(100) NULL,
      invasive_plant_management_areas varchar(100) NULL,
      ownership varchar(100) NULL,
      regional_districts varchar(100) NULL,
      flnro_districts varchar(100) NULL,
      moti_districts varchar(100) NULL,
      elevation int4 NULL,
      well_proximity int4 NULL,
      utm_zone int4 NULL,
      utm_northing float4 NULL,
      utm_easting float4 NULL,
      albers_northing float4 NULL,
      albers_easting float4 NULL,
      created_by varchar(100) NULL,
      form_status varchar(100) NULL DEFAULT 'Not Validated'::character varying,
      sync_status varchar(100) NULL DEFAULT 'Save Successful'::character varying,
      review_status varchar(100) NULL DEFAULT 'Not Reviewed'::character varying,
      reviewed_by varchar(100) NULL,
      reviewed_at timestamp NULL,
      species_positive jsonb NULL,
      species_negative jsonb NULL,
      jurisdiction _varchar NULL DEFAULT '{}'::character varying[],
      updated_by varchar(100) NULL,
      species_treated varchar(100) NULL,
      CONSTRAINT activity_incoming_data_geom_check CHECK (st_isvalid(geom)),
      CONSTRAINT activity_incoming_data_pkey PRIMARY KEY (activity_incoming_data_id)
    );
    CREATE INDEX activity_incoming_data_activity_id_idx ON invasivesbc.activity_incoming_data USING btree (activity_id);
    CREATE INDEX activity_incoming_data_activity_subtype_idx ON invasivesbc.activity_incoming_data USING btree (activity_subtype);
    CREATE INDEX activity_incoming_data_activity_type_idx ON invasivesbc.activity_incoming_data USING btree (activity_type);
    CREATE INDEX activity_incoming_data_geog_idx ON invasivesbc.activity_incoming_data USING gist (geog);
    CREATE INDEX activity_incoming_data_geom_idx ON invasivesbc.activity_incoming_data USING gist (geom);

    -- Permissions

    ALTER TABLE invasivesbc.activity_incoming_data OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.activity_incoming_data TO invasivebc;


    -- invasivesbc.admin_defined_shapes definition

    -- Drop table

    -- DROP TABLE invasivesbc.admin_defined_shapes;

    CREATE TABLE invasivesbc.admin_defined_shapes (
      id serial4 NOT NULL,
      visible bool NOT NULL DEFAULT true,
      created_at timestamp NOT NULL DEFAULT now(),
      created_by varchar(100) NULL,
      title varchar(100) NULL,
      geog public.geography(polygon, 4326) NULL,
      CONSTRAINT admin_defined_shapes_pkey PRIMARY KEY (id)
    );

    -- Permissions

    ALTER TABLE invasivesbc.admin_defined_shapes OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.admin_defined_shapes TO invasivebc;


    -- invasivesbc.application_user definition

    -- Drop table

    -- DROP TABLE invasivesbc.application_user;

    CREATE TABLE invasivesbc.application_user (
      user_id serial4 NOT NULL,
      first_name varchar(100) NULL,
      last_name varchar(100) NULL,
      email varchar(300) NOT NULL,
      preferred_username varchar(300) NOT NULL,
      account_status int2 NULL DEFAULT 1,
      expiry_date date NULL,
      activation_status int2 NULL DEFAULT 0,
      active_session_id int4 NULL,
      created_at timestamp NULL DEFAULT now(),
      updated_at timestamp NULL DEFAULT now(),
      idir_userid varchar(100) NULL,
      bceid_userid varchar(100) NULL,
      idir_account_name varchar(100) NULL,
      bceid_account_name varchar(100) NULL,
      work_phone_number varchar(100) NULL,
      funding_agencies varchar(1000) NULL,
      employer varchar(100) NULL,
      pac_number varchar(100) NULL,
      pac_service_number_1 varchar(100) NULL,
      pac_service_number_2 varchar(100) NULL,
      CONSTRAINT application_user_email_key UNIQUE (email),
      CONSTRAINT application_user_pkey PRIMARY KEY (user_id),
      CONSTRAINT application_user_preferred_username_key UNIQUE (preferred_username)
    );
    CREATE UNIQUE INDEX unique_bceid_userid_if_not_null ON invasivesbc.application_user USING btree (bceid_userid) WHERE (bceid_userid IS NOT NULL);
    CREATE UNIQUE INDEX unique_idir_userid_if_not_null ON invasivesbc.application_user USING btree (idir_userid) WHERE (idir_userid IS NOT NULL);

    -- Permissions

    ALTER TABLE invasivesbc.application_user OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.application_user TO invasivebc;


    -- invasivesbc.batch_uploads definition

    -- Drop table

    -- DROP TABLE invasivesbc.batch_uploads;

    CREATE TABLE invasivesbc.batch_uploads (
      id serial4 NOT NULL,
      csv_data text NOT NULL,
      status invasivesbc."batch_upload_status" NOT NULL DEFAULT 'NEW'::invasivesbc.batch_upload_status,
      "validation_status" invasivesbc."validation_status" NULL,
      validation_messages jsonb NULL,
      created_object_details jsonb NULL,
      created_at timestamp NOT NULL DEFAULT now(),
      created_by varchar(100) NOT NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.batch_uploads OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.batch_uploads TO invasivebc;


    -- invasivesbc.bc_large_grid definition

    -- Drop table

    -- DROP TABLE invasivesbc.bc_large_grid;

    CREATE TABLE invasivesbc.bc_large_grid (
      id int4 NOT NULL,
      geo public.geography(geometry, 4326) NOT NULL,
      CONSTRAINT bc_large_grid_pkey PRIMARY KEY (id)
    );

    -- Permissions

    ALTER TABLE invasivesbc.bc_large_grid OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.bc_large_grid TO invasivebc;


    -- invasivesbc.bc_small_grid definition

    -- Drop table

    -- DROP TABLE invasivesbc.bc_small_grid;

    CREATE TABLE invasivesbc.bc_small_grid (
      id serial4 NOT NULL,
      geo public.geography(geometry, 4326) NOT NULL,
      large_grid_item_id int4 NOT NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.bc_small_grid OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.bc_small_grid TO invasivebc;


    -- invasivesbc.biological_dispersal_extract definition

    -- Drop table

    -- DROP TABLE invasivesbc.biological_dispersal_extract;

    CREATE TABLE invasivesbc.biological_dispersal_extract (
      biologicaldispersalid serial4 NOT NULL,
      site_id int4 NOT NULL,
      site_paper_file_id varchar(120) NULL,
      district_lot_number varchar(6) NULL,
      jurisdictions varchar(1000) NOT NULL,
      site_created_date date NOT NULL,
      mapsheet varchar(10) NOT NULL,
      utm_zone int4 NOT NULL,
      utm_easting int4 NOT NULL,
      utm_northing int4 NOT NULL,
      decimal_latitude numeric(7, 5) NULL,
      decimal_longitude numeric(8, 5) NULL,
      biogeoclimatic_zone varchar(5) NOT NULL,
      sub_zone varchar(5) NOT NULL,
      variant int4 NULL,
      phase varchar(5) NULL,
      site_series varchar(5) NULL,
      soil_texture varchar(120) NULL,
      site_specific_use varchar(120) NOT NULL,
      invasive_plant varchar(100) NOT NULL,
      biological_agent varchar(20) NOT NULL,
      dispersal_paper_file_id varchar(120) NULL,
      dispersal_agency varchar(1000) NULL,
      inspection_date date NULL,
      foliar_feeding_damage varchar(1) NOT NULL,
      rootfeeding_damage varchar(1) NOT NULL,
      seedfeeding_damage varchar(1) NOT NULL,
      oviposition_marks varchar(1) NOT NULL,
      eggs_present varchar(1) NOT NULL,
      larvae_present varchar(1) NOT NULL,
      pupae_present varchar(1) NOT NULL,
      adults_present varchar(1) NOT NULL,
      tunnels_present varchar(1) NOT NULL,
      primary_surveyor varchar(120) NOT NULL,
      estimated_area_hectares numeric(10, 4) NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.biological_dispersal_extract OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.biological_dispersal_extract TO invasivebc;


    -- invasivesbc.biological_monitoring_extract definition

    -- Drop table

    -- DROP TABLE invasivesbc.biological_monitoring_extract;

    CREATE TABLE invasivesbc.biological_monitoring_extract (
      biologicalmonitoringid serial4 NOT NULL,
      site_id int4 NOT NULL,
      site_paper_file_id varchar(120) NULL,
      district_lot_number varchar(6) NULL,
      jurisdictions varchar(1000) NOT NULL,
      site_created_date date NOT NULL,
      mapsheet varchar(10) NOT NULL,
      utm_zone int4 NOT NULL,
      utm_easting int4 NOT NULL,
      utm_northing int4 NOT NULL,
      decimal_latitude numeric(7, 5) NULL,
      decimal_longitude numeric(8, 5) NULL,
      biogeoclimatic_zone varchar(5) NOT NULL,
      sub_zone varchar(5) NOT NULL,
      variant int4 NULL,
      phase varchar(5) NULL,
      site_series varchar(5) NULL,
      soil_texture varchar(120) NULL,
      site_specific_use varchar(120) NOT NULL,
      biological_agent varchar(20) NOT NULL,
      treatment_date date NULL,
      treatment_paper_file_id varchar(22) NULL,
      treatment_comments varchar(2000) NULL,
      monitoring_paper_file_id varchar(22) NULL,
      monitoring_agency varchar(120) NOT NULL,
      inspection_date date NULL,
      primary_surveyor varchar(120) NOT NULL,
      legacy_presence varchar(1) NOT NULL,
      foliar_feeding_damage varchar(1) NOT NULL,
      rootfeeding_damage varchar(1) NOT NULL,
      seedfeeding_damage varchar(1) NOT NULL,
      oviposition_marks varchar(1) NOT NULL,
      eggs_present varchar(1) NOT NULL,
      larvae_present varchar(1) NOT NULL,
      pupae_present varchar(1) NOT NULL,
      adults_present varchar(1) NOT NULL,
      tunnels_present varchar(1) NOT NULL,
      invasive_plant varchar(100) NOT NULL,
      estimated_area_hectares numeric(10, 4) NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.biological_monitoring_extract OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.biological_monitoring_extract TO invasivebc;


    -- invasivesbc.biological_treatment_extract definition

    -- Drop table

    -- DROP TABLE invasivesbc.biological_treatment_extract;

    CREATE TABLE invasivesbc.biological_treatment_extract (
      biotreatmentid serial4 NOT NULL,
      site_id int4 NOT NULL,
      site_paper_file_id varchar(20) NULL,
      district_lot_number varchar(6) NULL,
      jurisdictions varchar(1000) NOT NULL,
      site_created_date date NOT NULL,
      mapsheet varchar(10) NOT NULL,
      utm_zone int4 NOT NULL,
      utm_easting int4 NOT NULL,
      utm_northing int4 NOT NULL,
      decimal_latitude numeric(7, 5) NULL,
      decimal_longitude numeric(8, 5) NULL,
      biogeoclimatic_zone varchar(5) NOT NULL,
      sub_zone varchar(5) NOT NULL,
      variant int4 NULL,
      phase varchar(5) NULL,
      site_series varchar(5) NULL,
      soil_texture varchar(120) NULL,
      site_specific_use varchar(120) NOT NULL,
      invasive_plant varchar(100) NOT NULL,
      estimated_area_hectares numeric(10, 4) NOT NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      treatment_date date NULL,
      treatment_paper_file_id varchar(22) NULL,
      treatment_agency varchar(120) NOT NULL,
      treatment_comments varchar(2000) NULL,
      release_quantity int4 NOT NULL,
      bioagent_source varchar(120) NULL,
      biological_agent varchar(120) NOT NULL,
      employer varchar(120) NULL,
      primary_applicator varchar(120) NOT NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.biological_treatment_extract OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.biological_treatment_extract TO invasivebc;


    -- invasivesbc.chemical_monitoring_extract definition

    -- Drop table

    -- DROP TABLE invasivesbc.chemical_monitoring_extract;

    CREATE TABLE invasivesbc.chemical_monitoring_extract (
      chemicalmonitoringid serial4 NOT NULL,
      site_id int4 NOT NULL,
      site_paper_file_id varchar(120) NULL,
      district_lot_number varchar(6) NULL,
      jurisdictions varchar(1000) NOT NULL,
      site_created_date date NOT NULL,
      mapsheet varchar(10) NOT NULL,
      utm_zone int4 NOT NULL,
      utm_easting int4 NOT NULL,
      utm_northing int4 NOT NULL,
      decimal_latitude numeric(7, 5) NULL,
      decimal_longitude numeric(8, 5) NULL,
      biogeoclimatic_zone varchar(5) NOT NULL,
      sub_zone varchar(5) NOT NULL,
      variant int4 NULL,
      phase varchar(5) NULL,
      site_series varchar(5) NULL,
      soil_texture varchar(120) NULL,
      site_specific_use varchar(120) NOT NULL,
      service_licence_number varchar(25) NULL,
      pmp_number varchar(120) NOT NULL,
      pup_number varchar(25) NULL,
      invasive_plant varchar(100) NOT NULL,
      herbicide varchar(120) NOT NULL,
      treatment_method varchar(120) NOT NULL,
      treatment_date date NULL,
      treatment_paper_file_id varchar(22) NULL,
      treatment_comments varchar(2000) NULL,
      monitoring_paper_file_id varchar(120) NULL,
      monitoring_agency varchar(120) NOT NULL,
      inspection_date date NOT NULL,
      primary_surveyor varchar(120) NULL,
      efficacy_rating varchar(120) NOT NULL,
      estimated_area_hectares numeric(10, 4) NOT NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.chemical_monitoring_extract OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.chemical_monitoring_extract TO invasivebc;


    -- invasivesbc.chemical_treatment_extract definition

    -- Drop table

    -- DROP TABLE invasivesbc.chemical_treatment_extract;

    CREATE TABLE invasivesbc.chemical_treatment_extract (
      chemicaltreatmentid serial4 NOT NULL,
      site_id int4 NOT NULL,
      site_paper_file_id varchar(20) NULL,
      district_lot_number varchar(6) NULL,
      jurisdictions varchar(1000) NOT NULL,
      site_created_date date NOT NULL,
      mapsheet varchar(10) NOT NULL,
      utm_zone int4 NOT NULL,
      utm_easting int4 NOT NULL,
      utm_northing int4 NOT NULL,
      decimal_latitude numeric(7, 5) NULL,
      decimal_longitude numeric(8, 5) NULL,
      biogeoclimatic_zone varchar(5) NOT NULL,
      sub_zone varchar(5) NOT NULL,
      variant int4 NULL,
      phase varchar(5) NULL,
      site_series varchar(5) NULL,
      soil_texture varchar(120) NULL,
      site_specific_use varchar(120) NOT NULL,
      service_licence_number varchar(25) NULL,
      pmp_number varchar(120) NOT NULL,
      pup_number varchar(25) NULL,
      invasive_plant varchar(100) NOT NULL,
      treatment_date date NULL,
      treatment_paper_file_id varchar(22) NULL,
      treatment_agency varchar(120) NOT NULL,
      treatment_comments varchar(2000) NULL,
      herbicide varchar(120) NOT NULL,
      "method" varchar(120) NOT NULL,
      area_treated_hectares numeric(10, 4) NULL,
      amount_of_mix_used_litres numeric(10, 5) NULL,
      application_rate_litres_per_hectare numeric(6, 2) NULL,
      delivery_rate_litres_per_hectare int4 NULL,
      dilution_percent numeric(8, 4) NULL,
      amount_of_undiluted_herbicide_used_liters_litres numeric(8, 4) NULL,
      tank_mix varchar(3) NULL,
      employer varchar(120) NULL,
      primary_applicator varchar(120) NOT NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.chemical_treatment_extract OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.chemical_treatment_extract TO invasivebc;


    -- invasivesbc.code_category definition

    -- Drop table

    -- DROP TABLE invasivesbc.code_category;

    CREATE TABLE invasivesbc.code_category (
      code_category_id serial4 NOT NULL,
      code_category_name varchar(100) NOT NULL,
      code_category_title varchar(40) NULL,
      code_category_description varchar(4096) NULL,
      valid_from timestamptz NOT NULL DEFAULT now(),
      valid_to timestamptz NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NULL DEFAULT now(),
      created_by_user_id int4 NOT NULL,
      updated_by_user_id int4 NOT NULL,
      CONSTRAINT code_category_code_category_name_valid_from_unique UNIQUE (code_category_name, valid_from),
      CONSTRAINT code_category_pkey PRIMARY KEY (code_category_id)
    );

    -- Permissions

    ALTER TABLE invasivesbc.code_category OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.code_category TO invasivebc;


    -- invasivesbc.embedded_report_categories definition

    -- Drop table

    -- DROP TABLE invasivesbc.embedded_report_categories;

    CREATE TABLE invasivesbc.embedded_report_categories (
      id serial4 NOT NULL,
      "name" varchar(128) NOT NULL,
      sort_order int4 NOT NULL DEFAULT 1000,
      CONSTRAINT embedded_report_categories_name_key UNIQUE (name),
      CONSTRAINT embedded_report_categories_pkey PRIMARY KEY (id),
      CONSTRAINT embedded_report_categories_sort_order_check CHECK ((sort_order > 0))
    );

    -- Permissions

    ALTER TABLE invasivesbc.embedded_report_categories OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.embedded_report_categories TO invasivebc;


    -- invasivesbc.iapp_invbc_mapping definition

    -- Drop table

    -- DROP TABLE invasivesbc.iapp_invbc_mapping;

    CREATE TABLE invasivesbc.iapp_invbc_mapping (
      mapping_id serial4 NOT NULL,
      char_code varchar(2) NULL,
      invbc_name varchar(100) NULL,
      iapp_name varchar(100) NULL,
      environment varchar(1) NULL,
      "comments" varchar(300) NULL,
      CONSTRAINT iapp_invbc_mapping_pkey PRIMARY KEY (mapping_id)
    );

    -- Permissions

    ALTER TABLE invasivesbc.iapp_invbc_mapping OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.iapp_invbc_mapping TO invasivebc;


    -- invasivesbc.iapp_jurisdictions definition

    -- Drop table

    -- DROP TABLE invasivesbc.iapp_jurisdictions;

    CREATE TABLE invasivesbc.iapp_jurisdictions (
      id serial4 NOT NULL,
      jurisdiction varchar(70) NOT NULL,
      code varchar(10) NULL,
      CONSTRAINT iapp_jurisdictions_pkey PRIMARY KEY (id)
    );

    -- Permissions

    ALTER TABLE invasivesbc.iapp_jurisdictions OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.iapp_jurisdictions TO invasivebc;


    -- invasivesbc.iapp_spatial definition

    -- Drop table

    -- DROP TABLE invasivesbc.iapp_spatial;

    CREATE TABLE invasivesbc.iapp_spatial (
      site_id int4 NOT NULL,
      geog public.geography(geometry, 4326) NULL
    );
    CREATE INDEX spatial_iapp_geog_idx ON invasivesbc.iapp_spatial USING gist (geog);
    CREATE INDEX spatial_iapp_site_id_idx ON invasivesbc.iapp_spatial USING btree (site_id);

    -- Permissions

    ALTER TABLE invasivesbc.iapp_spatial OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.iapp_spatial TO invasivebc;


    -- invasivesbc.invasive_plant_no_treatment_extract definition

    -- Drop table

    -- DROP TABLE invasivesbc.invasive_plant_no_treatment_extract;

    CREATE TABLE invasivesbc.invasive_plant_no_treatment_extract (
      invasiveplantnotreatmentid int4 NOT NULL DEFAULT nextval('invasivesbc.invasive_plant_no_treatment_extr_invasiveplantnotreatmentid_seq'::regclass),
      site_id int4 NOT NULL,
      site_paper_file_id varchar(20) NULL,
      district_lot_number varchar(6) NULL,
      jurisdictions varchar(1000) NOT NULL,
      site_created_date date NOT NULL,
      mapsheet varchar(10) NOT NULL,
      utm_zone int4 NOT NULL,
      utm_easting int4 NOT NULL,
      utm_northing int4 NOT NULL,
      decimal_latitude numeric(7, 5) NULL,
      decimal_longitude numeric(8, 5) NULL,
      biogeoclimatic_zone varchar(5) NOT NULL,
      sub_zone varchar(5) NOT NULL,
      variant int4 NULL,
      phase varchar(5) NULL,
      site_series varchar(5) NULL,
      soil_texture varchar(120) NULL,
      site_specific_use varchar(120) NOT NULL,
      invasive_plant varchar(100) NOT NULL,
      survey_paper_file_id varchar(22) NULL,
      estimated_area_hectares numeric(10, 4) NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      survey_agency varchar(120) NOT NULL,
      primary_surveyor varchar(120) NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.invasive_plant_no_treatment_extract OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.invasive_plant_no_treatment_extract TO invasivebc;


    -- invasivesbc.mechanical_monitoring_extract definition

    -- Drop table

    -- DROP TABLE invasivesbc.mechanical_monitoring_extract;

    CREATE TABLE invasivesbc.mechanical_monitoring_extract (
      mechmonitoringid serial4 NOT NULL,
      site_id int4 NOT NULL,
      site_paper_file_id varchar(120) NULL,
      district_lot_number varchar(6) NULL,
      jurisdictions varchar(1000) NOT NULL,
      site_created_date date NOT NULL,
      mapsheet varchar(10) NOT NULL,
      utm_zone int4 NOT NULL,
      utm_easting int4 NOT NULL,
      utm_northing int4 NOT NULL,
      decimal_latitude numeric(7, 5) NULL,
      decimal_longitude numeric(8, 5) NULL,
      biogeoclimatic_zone varchar(5) NOT NULL,
      sub_zone varchar(5) NOT NULL,
      variant int4 NULL,
      phase varchar(5) NULL,
      site_series varchar(5) NULL,
      soil_texture varchar(120) NULL,
      site_specific_use varchar(120) NOT NULL,
      invasive_plant varchar(100) NOT NULL,
      treatment_method varchar(120) NOT NULL,
      treatment_date date NULL,
      treatment_paper_file_id varchar(22) NULL,
      treatment_comments varchar(2000) NULL,
      monitoring_paper_file_id varchar(22) NULL,
      monitoring_agency varchar(120) NOT NULL,
      inspection_date date NOT NULL,
      primary_surveyor varchar(120) NULL,
      efficacy_rating varchar(120) NOT NULL,
      estimated_area_hectares numeric(10, 4) NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.mechanical_monitoring_extract OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.mechanical_monitoring_extract TO invasivebc;


    -- invasivesbc.mechanical_treatment_extract definition

    -- Drop table

    -- DROP TABLE invasivesbc.mechanical_treatment_extract;

    CREATE TABLE invasivesbc.mechanical_treatment_extract (
      mechanicaltreatmentid serial4 NOT NULL,
      site_id int4 NOT NULL,
      site_paper_file_id varchar(20) NULL,
      district_lot_number varchar(6) NULL,
      jurisdictions varchar(1000) NOT NULL,
      site_created_date date NOT NULL,
      mapsheet varchar(10) NOT NULL,
      utm_zone int4 NOT NULL,
      utm_easting int4 NOT NULL,
      utm_northing int4 NOT NULL,
      decimal_latitude numeric(7, 5) NULL,
      decimal_longitude numeric(8, 5) NULL,
      biogeoclimatic_zone varchar(5) NOT NULL,
      sub_zone varchar(5) NOT NULL,
      variant int4 NULL,
      phase varchar(5) NULL,
      site_series varchar(5) NULL,
      soil_texture varchar(120) NULL,
      site_specific_use varchar(120) NOT NULL,
      invasive_plant varchar(100) NOT NULL,
      treatment_date date NULL,
      treatment_paper_file_id varchar(22) NULL,
      treatment_agency varchar(120) NOT NULL,
      treatment_comments varchar(2000) NULL,
      treatment_method varchar(120) NOT NULL,
      estimated_area_hectares numeric(10, 4) NOT NULL,
      employer varchar(120) NULL,
      primary_applicator varchar(120) NOT NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.mechanical_treatment_extract OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.mechanical_treatment_extract TO invasivebc;


    -- invasivesbc.planning_extract definition

    -- Drop table

    -- DROP TABLE invasivesbc.planning_extract;

    CREATE TABLE invasivesbc.planning_extract (
      planningid serial4 NOT NULL,
      site_id int4 NOT NULL,
      site_paper_file_id varchar(20) NULL,
      district_lot_number varchar(6) NULL,
      jurisdictions varchar(1000) NOT NULL,
      site_created_date date NOT NULL,
      mapsheet varchar(10) NOT NULL,
      utm_zone int4 NOT NULL,
      utm_easting int4 NOT NULL,
      utm_northing int4 NOT NULL,
      decimal_latitude numeric(7, 5) NULL,
      decimal_longitude numeric(8, 5) NULL,
      biogeoclimatic_zone varchar(5) NOT NULL,
      sub_zone varchar(5) NOT NULL,
      variant int4 NULL,
      phase varchar(5) NULL,
      site_series varchar(5) NULL,
      soil_texture varchar(120) NULL,
      site_specific_use varchar(120) NOT NULL,
      invasive_plant varchar(100) NOT NULL,
      activity varchar(120) NULL,
      agent_or_herbicide varchar(120) NULL,
      slope_percent int4 NULL,
      elevation int4 NULL,
      estimated_area_hectares numeric(10, 4) NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      survey_type varchar(120) NOT NULL,
      plan_date date NOT NULL,
      agency varchar(120) NOT NULL,
      planned_activity_month varchar(120) NOT NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.planning_extract OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.planning_extract TO invasivebc;


    -- invasivesbc.point_of_interest_incoming_data definition

    -- Drop table

    -- DROP TABLE invasivesbc.point_of_interest_incoming_data;

    CREATE TABLE invasivesbc.point_of_interest_incoming_data (
      point_of_interest_incoming_data_id int4 NOT NULL DEFAULT nextval('invasivesbc.point_of_interest_incoming_da_point_of_interest_incoming_da_seq'::regclass),
      point_of_interest_id serial4 NOT NULL,
      "version" int4 NULL,
      point_of_interest_type varchar(200) NULL,
      point_of_interest_subtype varchar(200) NULL,
      received_timestamp timestamp NOT NULL DEFAULT now(),
      geom public.geometry(geometry, 3005) NULL,
      geog public.geography(geometry, 4326) NULL,
      point_of_interest_payload jsonb NULL,
      biogeoclimatic_zones varchar(30) NULL,
      regional_invasive_species_organization_areas varchar(10) NULL,
      invasive_plant_management_areas varchar(50) NULL,
      forest_cover_ownership varchar(100) NULL,
      regional_districts varchar(100) NULL,
      flnro_districts varchar(100) NULL,
      moti_districts varchar(100) NULL,
      media_keys _text NULL,
      species_positive _varchar NOT NULL DEFAULT '{}'::character varying[],
      species_negative _varchar NOT NULL DEFAULT '{}'::character varying[],
      CONSTRAINT point_of_interest_incoming_data_geom_check CHECK (st_isvalid(geom)),
      CONSTRAINT point_of_interest_incoming_data_pkey PRIMARY KEY (point_of_interest_incoming_data_id)
    );
    CREATE INDEX poi_sub_type_idx ON invasivesbc.point_of_interest_incoming_data USING btree (point_of_interest_subtype);
    CREATE INDEX poi_type_idx ON invasivesbc.point_of_interest_incoming_data USING btree (point_of_interest_type);
    CREATE INDEX point_of_interest_incoming_data_gist ON invasivesbc.point_of_interest_incoming_data USING gist (geom);
    CREATE INDEX point_of_interest_incoming_data_gist2 ON invasivesbc.point_of_interest_incoming_data USING gist (geog);

    -- Permissions

    ALTER TABLE invasivesbc.point_of_interest_incoming_data OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.point_of_interest_incoming_data TO invasivebc;


    -- invasivesbc.site_selection_extract definition

    -- Drop table

    -- DROP TABLE invasivesbc.site_selection_extract;

    CREATE TABLE invasivesbc.site_selection_extract (
      siteselectionid serial4 NOT NULL,
      site_id int4 NOT NULL,
      site_paper_file_id varchar(20) NULL,
      district_lot_number varchar(6) NULL,
      jurisdictions varchar(1000) NOT NULL,
      site_created_date date NOT NULL,
      mapsheet varchar(10) NOT NULL,
      utm_zone int4 NOT NULL,
      utm_easting int4 NOT NULL,
      utm_northing int4 NOT NULL,
      decimal_latitude numeric(7, 5) NULL,
      decimal_longitude numeric(8, 5) NULL,
      biogeoclimatic_zone varchar(5) NOT NULL,
      sub_zone varchar(5) NOT NULL,
      variant int4 NULL,
      phase varchar(5) NULL,
      site_series varchar(5) NULL,
      soil_texture varchar(120) NULL,
      site_specific_use varchar(120) NOT NULL,
      survey_paper_file_id varchar(22) NULL,
      invasive_plant varchar(100) NOT NULL,
      last_surveyed_date date NOT NULL,
      primary_surveyor varchar(120) NULL,
      estimated_area_hectares numeric(10, 4) NULL,
      distribution varchar(120) NULL,
      slope_percent int4 NULL,
      aspect int4 NULL,
      elevation int4 NULL,
      treatment_date date NULL,
      treatment_type varchar(120) NULL,
      all_species_on_site varchar(3000) NOT NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.site_selection_extract OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.site_selection_extract TO invasivebc;


    -- invasivesbc.species_ref_raw definition

    -- Drop table

    -- DROP TABLE invasivesbc.species_ref_raw;

    -- CREATE TABLE invasivesbc.species_ref_raw (
    --  species_id serial4 NOT NULL,
    --  common_name varchar(50) NOT NULL,
    --  latin_name varchar(50) NOT NULL,
    --  genus varchar(4) NOT NULL,
    --  species varchar(3) NOT NULL,
    --  map_symbol varchar(2) NOT NULL
    -- );

    -- Permissions

    -- ALTER TABLE invasivesbc.species_ref_raw OWNER TO invasivebc;
    -- GRANT ALL ON TABLE invasivesbc.species_ref_raw TO invasivebc;


    -- invasivesbc.survey_extract definition

    -- Drop table

    -- DROP TABLE invasivesbc.survey_extract;

    CREATE TABLE invasivesbc.survey_extract (
      surveyid serial4 NOT NULL,
      site_id int4 NOT NULL,
      site_paper_file_id varchar(20) NULL,
      district_lot_number varchar(6) NULL,
      jurisdictions varchar(1000) NOT NULL,
      site_created_date date NULL,
      mapsheet varchar(10) NOT NULL,
      utm_zone int4 NOT NULL,
      utm_easting int4 NOT NULL,
      utm_northing int4 NOT NULL,
      decimal_latitude numeric(7, 5) NULL,
      decimal_longitude numeric(8, 5) NULL,
      biogeoclimatic_zone varchar(5) NOT NULL,
      sub_zone varchar(5) NOT NULL,
      variant int4 NULL,
      phase varchar(5) NULL,
      site_series varchar(5) NULL,
      soil_texture varchar(120) NULL,
      site_specific_use varchar(120) NOT NULL,
      invasive_plant varchar(100) NOT NULL,
      survey_paper_file_id varchar(22) NULL,
      survey_date date NOT NULL,
      estimated_area_hectares numeric(10, 4) NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      survey_agency varchar(120) NOT NULL,
      primary_surveyor varchar(120) NULL,
      survey_comments varchar(2000) NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    -- Permissions

    ALTER TABLE invasivesbc.survey_extract OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.survey_extract TO invasivebc;


    -- invasivesbc.user_role definition

    -- Drop table

    -- DROP TABLE invasivesbc.user_role;

    CREATE TABLE invasivesbc.user_role (
      role_id serial4 NOT NULL,
      role_description varchar(250) NOT NULL,
      role_name varchar(250) NOT NULL,
      created_at timestamp NULL DEFAULT now(),
      updated_at timestamp NULL DEFAULT now(),
      metabase_group varchar(100) NULL,
      CONSTRAINT user_role_pkey PRIMARY KEY (role_id)
    );

    -- Permissions

    ALTER TABLE invasivesbc.user_role OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.user_role TO invasivebc;


    -- invasivesbc.code_header definition

    -- Drop table

    -- DROP TABLE invasivesbc.code_header;

    CREATE TABLE invasivesbc.code_header (
      code_header_id serial4 NOT NULL,
      code_category_id int4 NULL,
      code_header_name varchar(100) NOT NULL,
      code_header_title varchar(40) NULL,
      code_header_description varchar(4096) NULL,
      valid_from timestamptz NOT NULL DEFAULT now(),
      valid_to timestamptz NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NULL DEFAULT now(),
      created_by_user_id int4 NOT NULL,
      updated_by_user_id int4 NOT NULL,
      CONSTRAINT code_header_code_category_id_code_header_name_valid_from_unique UNIQUE (code_category_id, code_header_name, valid_from),
      CONSTRAINT code_header_pkey PRIMARY KEY (code_header_id),
      CONSTRAINT code_header_code_category_id_foreign FOREIGN KEY (code_category_id) REFERENCES invasivesbc.code_category(code_category_id)
    );

    -- Permissions

    ALTER TABLE invasivesbc.code_header OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.code_header TO invasivebc;


    -- invasivesbc.embedded_reports definition

    -- Drop table

    -- DROP TABLE invasivesbc.embedded_reports;

    CREATE TABLE invasivesbc.embedded_reports (
      metabase_id int4 NOT NULL,
      category_id int4 NOT NULL,
      display_name varchar(100) NOT NULL,
      enabled bool NOT NULL DEFAULT true,
      sort_order int4 NOT NULL DEFAULT 1000,
      id serial4 NOT NULL,
      metabase_resource invasivesbc."embedded_metabase_resource_type" NOT NULL DEFAULT 'question'::invasivesbc.embedded_metabase_resource_type,
      CONSTRAINT embedded_reports_display_name_key UNIQUE (display_name),
      CONSTRAINT embedded_reports_id_check CHECK ((metabase_id > 0)),
      CONSTRAINT embedded_reports_pkey PRIMARY KEY (id),
      CONSTRAINT embedded_reports_sort_order_check CHECK ((sort_order > 0)),
      CONSTRAINT embedded_reports_category_id_fkey FOREIGN KEY (category_id) REFERENCES invasivesbc.embedded_report_categories(id) ON DELETE RESTRICT
    );

    -- Permissions

    ALTER TABLE invasivesbc.embedded_reports OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.embedded_reports TO invasivebc;


    -- invasivesbc.user_access definition

    -- Drop table

    -- DROP TABLE invasivesbc.user_access;

    CREATE TABLE invasivesbc.user_access (
      access_id serial4 NOT NULL,
      user_id int4 NULL,
      role_id int4 NULL,
      created_at timestamp NULL DEFAULT now(),
      updated_at timestamp NULL DEFAULT now(),
      CONSTRAINT user_access_pkey PRIMARY KEY (access_id),
      CONSTRAINT user_access_user_id_role_id_key UNIQUE (user_id, role_id),
      CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES invasivesbc.user_role(role_id) ON DELETE CASCADE,
      CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE CASCADE
    );

    -- Permissions

    ALTER TABLE invasivesbc.user_access OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.user_access TO invasivebc;


    -- invasivesbc.code definition

    -- Drop table

    -- DROP TABLE invasivesbc.code;

    CREATE TABLE invasivesbc.code (
      code_id serial4 NOT NULL,
      code_header_id int4 NULL,
      code_name varchar(40) NOT NULL,
      code_description varchar(300) NOT NULL,
      code_sort_order int4 NULL,
      valid_from timestamptz NOT NULL DEFAULT now(),
      valid_to timestamptz NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NULL DEFAULT now(),
      created_by_user_id int4 NOT NULL,
      updated_by_user_id int4 NOT NULL,
      CONSTRAINT code_code_header_id_code_name_valid_from_unique UNIQUE (code_header_id, code_name, valid_from),
      CONSTRAINT code_pkey PRIMARY KEY (code_id),
      CONSTRAINT code_code_header_id_foreign FOREIGN KEY (code_header_id) REFERENCES invasivesbc.code_header(code_header_id)
    );

    -- Permissions

    ALTER TABLE invasivesbc.code OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.code TO invasivebc;


    -- invasivesbc.activity_current source

    CREATE OR REPLACE VIEW invasivesbc.activity_current
    AS SELECT activity_incoming_data.activity_id,
        max(activity_incoming_data.activity_incoming_data_id) AS incoming_data_id
      FROM invasivesbc.activity_incoming_data
      WHERE activity_incoming_data.deleted_timestamp IS NULL
      GROUP BY activity_incoming_data.activity_id;

    -- Permissions

    ALTER TABLE invasivesbc.activity_current OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.activity_current TO invasivebc;


    -- invasivesbc.activity_jurisdictions source

    CREATE OR REPLACE VIEW invasivesbc.activity_jurisdictions
    AS WITH jurisdictions AS (
            SELECT a_1.activity_incoming_data_id,
                jsonb_array_elements(a_1.activity_payload #> '{form_data,activity_data,jurisdictions}'::text[]) AS jurisdictions_array
              FROM invasivesbc.activity_incoming_data a_1
                JOIN invasivesbc.activity_current b_1 ON a_1.activity_incoming_data_id = b_1.incoming_data_id
            )
    SELECT a.activity_id,
        a.activity_incoming_data_id,
        j.jurisdictions_array,
        btrim((j.jurisdictions_array -> 'jurisdiction_code'::text)::text, '"'::text) AS jurisdiction_code,
        btrim((j.jurisdictions_array -> 'percent_covered'::text)::text, '"'::text)::double precision AS jurisdiction_percentage
      FROM invasivesbc.activity_incoming_data a
        JOIN invasivesbc.activity_current b ON a.activity_incoming_data_id = b.incoming_data_id
        LEFT JOIN jurisdictions j ON j.activity_incoming_data_id = a.activity_incoming_data_id
      ORDER BY a.activity_id DESC;

    -- Permissions

    ALTER TABLE invasivesbc.activity_jurisdictions OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.activity_jurisdictions TO invasivebc;


    -- invasivesbc.activity_monitoring_biological_terrestrialplant_with_codes source

    CREATE OR REPLACE VIEW invasivesbc.activity_monitoring_biological_terrestrialplant_with_codes
    AS SELECT activity_incoming_data.activity_id,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'invasive_plant_code'::text)::text, '"'::text) AS invasive_plant_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'mechanical_method_code'::text)::text, '"'::text) AS mechanical_method_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'mechanical_disposal_code'::text)::text, '"'::text) AS mechanical_disposal_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'root_removal_code'::text)::text, '"'::text) AS root_removal_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'soil_disturbance_code'::text)::text, '"'::text) AS soil_disturbance_code,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'signage_on_site'::text)::text)::boolean AS signage_on_site
      FROM invasivesbc.activity_incoming_data
      WHERE activity_incoming_data.activity_type::text = 'Monitoring'::text AND activity_incoming_data.activity_subtype::text = 'Monitoring_BiologicalTerrestrialPlant'::text AND activity_incoming_data.deleted_timestamp IS NULL;

    -- Permissions

    ALTER TABLE invasivesbc.activity_monitoring_biological_terrestrialplant_with_codes OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.activity_monitoring_biological_terrestrialplant_with_codes TO invasivebc;


    -- invasivesbc.activity_observation_aquaticplant_with_codes source

    CREATE OR REPLACE VIEW invasivesbc.activity_observation_aquaticplant_with_codes
    AS SELECT activity_incoming_data.activity_id,
        activity_incoming_data.version,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'invasive_plant_code'::text)::text, '"'::text) AS invasive_plant_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'specific_use_code'::text)::text, '"'::text) AS specific_use_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'proposed_treatment_code'::text)::text, '"'::text) AS proposed_treatment_code,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'flowering'::text)::text)::boolean AS flowering,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_life_stage_code'::text)::text, '"'::text) AS plant_life_stage_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_health_code'::text)::text, '"'::text) AS plant_health_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_seed_stage_code'::text)::text, '"'::text) AS plant_seed_stage_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'range_unit_number'::text)::text, '"'::text) AS range_unit_number,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'legacy_site_ind'::text)::text)::boolean AS legacy_site_ind,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'early_detection_rapid_resp_ind'::text)::text)::boolean AS early_detection_rapid_resp_ind,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'research_detection_ind'::text)::text)::boolean AS research_detection_ind,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'sample_point_number'::text)::text, '"'::text) AS sample_point_number,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'special_care_ind'::text)::text)::boolean AS special_care_ind,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'biological_ind'::text)::text)::boolean AS biological_ind,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'secchi_depth'::text)::text)::numeric AS secchi_depth,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'water_depth'::text)::text)::numeric AS water_depth,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'voucher_submitted_ind'::text)::text)::boolean AS voucher_submitted_ind,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'voucher_submission_detail'::text)::text, '"'::text) AS voucher_submission_detail
      FROM invasivesbc.activity_incoming_data
      WHERE activity_incoming_data.activity_type::text = 'Observation'::text AND activity_incoming_data.activity_subtype::text = 'Activity_Observation_PlantAquatic'::text AND activity_incoming_data.deleted_timestamp IS NULL;

    -- Permissions

    ALTER TABLE invasivesbc.activity_observation_aquaticplant_with_codes OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.activity_observation_aquaticplant_with_codes TO invasivebc;


    -- invasivesbc.activity_observation_terrestrialplant_with_codes source

    CREATE OR REPLACE VIEW invasivesbc.activity_observation_terrestrialplant_with_codes
    AS SELECT activity_incoming_data.activity_id,
        activity_incoming_data.version,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'invasive_plant_code'::text)::text, '"'::text) AS invasive_plant_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'invasive_plant_density_code'::text)::text, '"'::text) AS invasive_plant_density_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'invasive_plant_distribution_code'::text)::text, '"'::text) AS invasive_plant_distribution_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'soil_texture_code'::text)::text, '"'::text) AS soil_texture_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'specific_use_code'::text)::text, '"'::text) AS specific_use_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'slope_code'::text)::text, '"'::text) AS slope_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'aspect_code'::text)::text, '"'::text) AS aspect_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'proposed_treatment_code'::text)::text, '"'::text) AS proposed_treatment_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'range_unit_number'::text)::text, '"'::text) AS range_unit_number,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_life_stage_code'::text)::text, '"'::text) AS plant_life_stage_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_health_code'::text)::text, '"'::text) AS plant_health_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_seed_stage_code'::text)::text, '"'::text) AS plant_seed_stage_code,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'flowering'::text)::text)::boolean AS flowering,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'legacy_site_ind'::text)::text)::boolean AS legacy_site_ind,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'early_detection_rapid_resp_ind'::text)::text)::boolean AS early_detection_rapid_resp_ind,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'research_detection_ind'::text)::text)::boolean AS research_detection_ind,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'well_ind'::text)::text)::boolean AS well_ind,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'special_care_ind'::text)::text)::boolean AS special_care_ind,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'biological_ind'::text)::text)::boolean AS biological_ind
      FROM invasivesbc.activity_incoming_data
      WHERE activity_incoming_data.activity_type::text = 'Observation'::text AND activity_incoming_data.activity_subtype::text = 'Activity_Observation_PlantTerrestrial'::text AND activity_incoming_data.deleted_timestamp IS NULL;

    -- Permissions

    ALTER TABLE invasivesbc.activity_observation_terrestrialplant_with_codes OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.activity_observation_terrestrialplant_with_codes TO invasivebc;


    -- invasivesbc.activity_treatment_biological_terrestrialplant_with_codes source

    CREATE OR REPLACE VIEW invasivesbc.activity_treatment_biological_terrestrialplant_with_codes
    AS SELECT activity_incoming_data.activity_id,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'invasive_plant_code'::text)::text, '"'::text) AS invasive_plant_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'classified_area_code'::text)::text, '"'::text) AS classified_area_code,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'applicator1_licence_number'::text)::text)::integer AS applicator1_licence_number,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'agent_source'::text)::text, '"'::text) AS agent_source,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'biological_agent_code'::text)::text, '"'::text) AS biological_agent_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'biological_agent_stage_code'::text)::text, '"'::text) AS biological_agent_stage_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'bioagent_maturity_status_code'::text)::text, '"'::text) AS bioagent_maturity_status_code
      FROM invasivesbc.activity_incoming_data
      WHERE activity_incoming_data.activity_type::text = 'Treatment'::text AND activity_incoming_data.activity_subtype::text = 'Treatment_BiologicalPlant'::text AND activity_incoming_data.deleted_timestamp IS NULL;

    -- Permissions

    ALTER TABLE invasivesbc.activity_treatment_biological_terrestrialplant_with_codes OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.activity_treatment_biological_terrestrialplant_with_codes TO invasivebc;


    -- invasivesbc.activity_treatment_chemical_terrestrialplant_with_codes source

    CREATE OR REPLACE VIEW invasivesbc.activity_treatment_chemical_terrestrialplant_with_codes
    AS SELECT activity_incoming_data.activity_id,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'applicator1_first_name'::text)::text, '"'::text) AS applicator1_first_name,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'applicator1_last_name'::text)::text, '"'::text) AS applicator1_last_name,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'applicator1_licence_number'::text)::text)::integer AS applicator1_licence_number,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'applicator2_first_name'::text)::text, '"'::text) AS applicator2_first_name,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'applicator2_last_name'::text)::text, '"'::text) AS applicator2_last_name,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'applicator2_licence_number'::text)::text)::numeric AS applicator2_licence_number,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'pesticide_employer_code'::text)::text, '"'::text) AS pesticide_employer_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'pesticide_use_permit_PUP'::text)::text, '"'::text) AS pesticide_use_permit_pup,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'pest_management_plan'::text)::text, '"'::text) AS pest_management_plan,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'treatment_issues_code'::text)::text, '"'::text) AS treatment_issues_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'chemical_method_code'::text)::text, '"'::text) AS chemical_method_code,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'temperature'::text)::text)::integer AS temperature,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'wind_speed'::text)::text)::integer AS wind_speed,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'wind_direction_code'::text)::text, '"'::text) AS wind_direction_code,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'humidity'::text)::text)::integer AS humidity
      FROM invasivesbc.activity_incoming_data
      WHERE activity_incoming_data.activity_type::text = 'Treatment'::text AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlant'::text AND activity_incoming_data.deleted_timestamp IS NULL;

    -- Permissions

    ALTER TABLE invasivesbc.activity_treatment_chemical_terrestrialplant_with_codes OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.activity_treatment_chemical_terrestrialplant_with_codes TO invasivebc;


    -- invasivesbc.activity_treatment_mechanical_terrestrialplant_with_codes source

    CREATE OR REPLACE VIEW invasivesbc.activity_treatment_mechanical_terrestrialplant_with_codes
    AS SELECT activity_incoming_data.activity_id,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'invasive_plant_code'::text)::text, '"'::text) AS invasive_plant_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'mechanical_method_code'::text)::text, '"'::text) AS mechanical_method_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'mechanical_disposal_code'::text)::text, '"'::text) AS mechanical_disposal_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'root_removal_code'::text)::text, '"'::text) AS root_removal_code,
        btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'soil_disturbance_code'::text)::text, '"'::text) AS soil_disturbance_code,
        ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'signage_on_site'::text)::text)::boolean AS signage_on_site
      FROM invasivesbc.activity_incoming_data
      WHERE activity_incoming_data.activity_type::text = 'Treatment'::text AND activity_incoming_data.activity_subtype::text = 'Treatment_MechanicalPlant'::text AND activity_incoming_data.deleted_timestamp IS NULL;

    -- Permissions

    ALTER TABLE invasivesbc.activity_treatment_mechanical_terrestrialplant_with_codes OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.activity_treatment_mechanical_terrestrialplant_with_codes TO invasivebc;

    CREATE  or replace  FUNCTION public.convert_string_list_to_array_elements(text) RETURNS TABLE(f1 text)
      AS $$ SELECT  unnest(('{' || $1::text || '}')::text[]); $$
      LANGUAGE SQL;

    ${legacyFunctionDef}

   -- invasivesbc.common_summary source

    CREATE OR REPLACE VIEW invasivesbc.common_summary
    AS WITH jurisdiction_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_data,jurisdictions}'::text[]) AS jurisdictions_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            ), project_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_data,project_code}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            ), project_list AS (
            SELECT p_1.activity_incoming_data_id,
                string_agg(p_1.json_array #>> '{description}'::text[], ', '::text ORDER BY (p_1.json_array #>> '{description}'::text[])) AS project
              FROM project_array p_1
              GROUP BY p_1.activity_incoming_data_id
            ), person_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_type_data,activity_persons}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            ), person_select AS (
            SELECT p_1.activity_incoming_data_id,
                p_1.json_array #>> '{person_name}'::text[] AS person_name,
                p_1.json_array #>> '{applicator_license}'::text[] AS applicator_license
              FROM person_array p_1
            ), person_list AS (
            SELECT p_1.activity_incoming_data_id,
                string_agg(p_1.person_name, ', '::text ORDER BY p_1.person_name) AS person_name
              FROM person_select p_1
              GROUP BY p_1.activity_incoming_data_id
            ), treatment_person_list AS (
            SELECT p_1.activity_incoming_data_id,
                string_agg((p_1.person_name || ', '::text) || p_1.applicator_license, ', '::text ORDER BY p_1.person_name) AS treatment_person_name
              FROM person_select p_1
              GROUP BY p_1.activity_incoming_data_id
            ), jurisdictions_list AS (
            SELECT j_1.activity_incoming_data_id,
                j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[] AS jurisdiction_code,
                jurisdiction_codes.code_description AS jurisdiction,
                j_1.jurisdictions_array #>> '{percent_covered}'::text[] AS percent_covered
              FROM jurisdiction_array j_1
                LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON jurisdiction_code_header.code_header_title::text = 'jurisdiction_code'::text AND jurisdiction_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code jurisdiction_codes ON jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id AND (j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) = jurisdiction_codes.code_name::text
            ), jurisdiction_agg AS (
            SELECT j_1.activity_incoming_data_id,
                string_agg(((j_1.jurisdiction::text || ' '::text) || j_1.percent_covered) || '%'::text, ', '::text ORDER BY j_1.jurisdiction) AS jurisdiction
              FROM jurisdictions_list j_1
              GROUP BY j_1.activity_incoming_data_id
            ), funding_agency_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                convert_string_list_to_array_elements(activity_incoming_data.activity_payload #>> '{form_data,activity_data,invasive_species_agency_code}'::text[]) AS funding_list
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            ), funding_agency_select AS (
            SELECT f_1.activity_incoming_data_id,
                f_1.funding_list,
                invasive_species_agency_codes.code_description AS funding_agency
              FROM funding_agency_array f_1
                LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON invasive_species_agency_code_header.code_header_title::text = 'invasive_species_agency_code'::text AND invasive_species_agency_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_species_agency_codes ON invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id AND f_1.funding_list = invasive_species_agency_codes.code_name::text
            ), funding_agency_agg AS (
            SELECT f_1.activity_incoming_data_id,
                string_agg(f_1.funding_agency::text, ', '::text ORDER BY (f_1.funding_agency::text)) AS funding_agency
              FROM funding_agency_select f_1
              GROUP BY f_1.activity_incoming_data_id
            )
    SELECT j.jurisdiction,
        a.activity_incoming_data_id,
        a.activity_id,
        a.activity_payload #>> '{short_id}'::text[] AS short_id,
        l.project AS project_code,
        a.activity_payload #>> '{activity_type}'::text[] AS activity_type,
        a.activity_payload #>> '{activity_subtype}'::text[] AS activity_subtype,
        a.form_status,
        translate(a.activity_payload #>> '{form_data,activity_data,activity_date_time}'::text[], 'T'::text, ' '::text) AS activity_date_time,
        a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[] AS utm_zone,
        a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[] AS utm_easting,
        a.activity_payload #>> '{form_data,activity_data,utm_northing}'::text[] AS utm_northing,
        a.activity_payload #>> '{form_data,activity_data,latitude}'::text[] AS latitude,
        a.activity_payload #>> '{form_data,activity_data,longitude}'::text[] AS longitude,
        translate(a.activity_payload #>> '{species_positive}'::text[], '[]"'::text, ''::text) AS species_positive,
        jsonb_array_length(a.activity_payload #> '{species_positive}'::text[]) AS positive_species_count,
        translate(a.activity_payload #>> '{species_negative}'::text[], '[]"'::text, ''::text) AS species_negative,
        jsonb_array_length(a.activity_payload #> '{species_negative}'::text[]) AS negative_species_count,
        a.activity_payload #>> '{form_data,activity_data,reported_area}'::text[] AS reported_area_sqm,
        a.activity_payload #>> '{form_data,activity_type_data,pre_treatment_observation}'::text[] AS pre_treatment_observation,
        p.person_name AS observation_person,
        t.treatment_person_name AS treatment_person,
        a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[] AS employer_code,
        employer_codes.code_description AS employer_description,
        f.funding_agency,
        a.activity_payload #>> '{form_data,activity_data,access_description}'::text[] AS access_description,
        a.activity_payload #>> '{form_data,activity_data,location_description}'::text[] AS location_description,
        a.activity_payload #>> '{form_data,activity_data,general_comment}'::text[] AS comment,
        a.elevation,
        a.well_proximity,
        a.geom,
        a.geog,
        a.biogeoclimatic_zones,
        a.regional_invasive_species_organization_areas,
        a.invasive_plant_management_areas,
        a.ownership,
        a.regional_districts,
        a.flnro_districts,
        a.moti_districts,
            CASE
                WHEN a.media_keys IS NULL THEN 'No'::text
                ELSE 'Yes'::text
            END AS photo,
        a.created_timestamp,
        a.received_timestamp
      FROM invasivesbc.activity_incoming_data a
        JOIN project_list l ON l.activity_incoming_data_id = a.activity_incoming_data_id
        JOIN treatment_person_list t ON t.activity_incoming_data_id = a.activity_incoming_data_id
        JOIN person_list p ON p.activity_incoming_data_id = a.activity_incoming_data_id
        JOIN jurisdiction_agg j ON j.activity_incoming_data_id = a.activity_incoming_data_id
        JOIN funding_agency_agg f ON f.activity_incoming_data_id = a.activity_incoming_data_id
        LEFT JOIN invasivesbc.code_header employer_code_header ON employer_code_header.code_header_title::text = 'employer_code'::text AND employer_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code employer_codes ON employer_codes.code_header_id = employer_code_header.code_header_id AND (a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) = employer_codes.code_name::text
      WHERE (a.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND a.form_status::text = 'Submitted'::text;

    -- invasivesbc.biocontrol_collection_summary source

    CREATE OR REPLACE VIEW invasivesbc.biocontrol_collection_summary
    AS WITH biocontrol_collection_json AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.form_status,
                activity_incoming_data.activity_payload #>> '{form_data,activity_type_data,linked_id}'::text[] AS linked_treatment_id,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data}'::text[] AS json_data
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), collection_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                biocontrol.value ->> 'invasive_plant_code'::text AS invasive_plant_code,
                actual_quantity.value ->> 'biological_agent_stage_code'::text AS actual_agent_stage_code,
                actual_quantity.value ->> 'biological_agent_number'::text AS actual_agent_count,
                estimated_quantity.value ->> 'biological_agent_stage_code'::text AS estimated_agent_stage_code,
                estimated_quantity.value ->> 'biological_agent_number'::text AS estimated_agent_count,
                biocontrol.value ->> 'comment'::text AS collection_comment,
                biocontrol.value ->> 'stop_time'::text AS stop_time,
                biocontrol.value ->> 'start_time'::text AS start_time,
                biocontrol.value ->> 'plant_count'::text AS plant_count,
                biocontrol.value ->> 'collection_type'::text AS collection_type,
                biocontrol.value ->> 'collection_method'::text AS collection_method_code,
                biocontrol.value ->> 'biological_agent_code'::text AS biological_agent_code,
                biocontrol.value ->> 'historical_iapp_site_id'::text AS historical_iapp_site_id,
                biocontrol.value ->> 'total_bio_agent_quantity_actual'::text AS total_agent_quantity_actual,
                biocontrol.value ->> 'total_bio_agent_quantity_estimated'::text AS total_agent_quantity_estimated
              FROM invasivesbc.activity_incoming_data,
                LATERAL jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,Biocontrol_Collection_Information}'::text[]) biocontrol(value)
                LEFT JOIN LATERAL jsonb_array_elements(biocontrol.value -> 'estimated_quantity_and_life_stage_of_agent_collected'::text) estimated_quantity(value) ON true
                LEFT JOIN LATERAL jsonb_array_elements(biocontrol.value -> 'actual_quantity_and_life_stage_of_agent_collected'::text) actual_quantity(value) ON true
            ), collection_array_select AS (
            SELECT c_1.activity_incoming_data_id,
                c_1.invasive_plant_code,
                invasive_plant_codes.code_description AS invasive_plant,
                c_1.actual_agent_stage_code,
                biological_agent_stage_codes.code_description AS actual_agent_stage,
                c_1.actual_agent_count,
                c_1.estimated_agent_stage_code,
                estimated_agent_stage_codes.code_description AS estimated_agent_stage,
                c_1.estimated_agent_count,
                c_1.total_agent_quantity_actual,
                c_1.total_agent_quantity_estimated,
                c_1.collection_comment,
                c_1.stop_time,
                c_1.start_time,
                c_1.plant_count,
                c_1.collection_type,
                c_1.collection_method_code,
                biocontrol_monitoring_methods_codes.code_description AS collection_method,
                c_1.biological_agent_code,
                biological_agent_codes.code_description AS biological_agent,
                c_1.historical_iapp_site_id
              FROM collection_array c_1
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND c_1.invasive_plant_code = invasive_plant_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON biological_agent_stage_code_header.code_header_title::text = 'biological_agent_stage_code'::text AND biological_agent_stage_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_stage_codes ON biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id AND c_1.actual_agent_stage_code = biological_agent_stage_codes.code_name::text
                LEFT JOIN invasivesbc.code_header estimated_agent_stage_code_header ON estimated_agent_stage_code_header.code_header_title::text = 'biological_agent_stage_code'::text AND estimated_agent_stage_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code estimated_agent_stage_codes ON estimated_agent_stage_codes.code_header_id = estimated_agent_stage_code_header.code_header_id AND c_1.estimated_agent_stage_code = estimated_agent_stage_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biological_agent_code_header ON biological_agent_code_header.code_header_title::text = 'biological_agent_code'::text AND biological_agent_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_codes ON biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id AND c_1.biological_agent_code = biological_agent_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biocontrol_monitoring_methods_code_header ON biocontrol_monitoring_methods_code_header.code_header_title::text = 'biocontrol_monitoring_methods_code'::text AND biocontrol_monitoring_methods_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biocontrol_monitoring_methods_codes ON biocontrol_monitoring_methods_codes.code_header_id = biocontrol_monitoring_methods_code_header.code_header_id AND c_1.collection_method_code = biocontrol_monitoring_methods_codes.code_name::text
            ), collection_string_agg AS (
            SELECT c_1.activity_incoming_data_id,
                c_1.invasive_plant,
                c_1.collection_comment,
                c_1.stop_time,
                c_1.start_time,
                c_1.plant_count,
                c_1.collection_type,
                c_1.collection_method,
                c_1.biological_agent,
                c_1.historical_iapp_site_id,
                c_1.total_agent_quantity_actual,
                c_1.total_agent_quantity_estimated,
                string_agg(DISTINCT c_1.actual_agent_stage_code, ', '::text ORDER BY c_1.actual_agent_stage_code) AS actual_agent_stage,
                string_agg(DISTINCT c_1.actual_agent_count, ', '::text ORDER BY c_1.actual_agent_count) AS actual_agent_count,
                string_agg(DISTINCT c_1.estimated_agent_stage_code, ', '::text ORDER BY c_1.estimated_agent_stage_code) AS estimated_agent_stage,
                string_agg(DISTINCT c_1.estimated_agent_count, ', '::text ORDER BY c_1.estimated_agent_count) AS estimated_agent_count
              FROM collection_array_select c_1
              GROUP BY c_1.activity_incoming_data_id, c_1.invasive_plant, c_1.collection_comment, c_1.stop_time, c_1.start_time, c_1.plant_count, c_1.collection_type, c_1.collection_method, c_1.biological_agent, c_1.historical_iapp_site_id, c_1.total_agent_quantity_actual, c_1.total_agent_quantity_estimated
            ), biocontrol_collection_monitoring_select AS (
            SELECT b_1.activity_incoming_data_id,
                b_1.linked_treatment_id,
                b_1.json_data #>> '{Weather_Conditions,temperature}'::text[] AS temperature,
                b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[] AS cloud_cover_code,
                cloud_cover_codes.code_description AS cloud_cover,
                b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[] AS precipitation_code,
                precipitation_codes.code_description AS precipitation,
                b_1.json_data #>> '{Weather_Conditions,wind_speed}'::text[] AS wind_speed,
                b_1.json_data #>> '{Weather_Conditions,wind_aspect}'::text[] AS wind_aspect,
                b_1.json_data #>> '{Weather_Conditions,weather_comments}'::text[] AS weather_comments,
                b_1.json_data #>> '{Microsite_Conditions,mesoslope_position_code}'::text[] AS mesoslope_position_code,
                mesoslope_position_codes.code_description AS mesoslope_position,
                b_1.json_data #>> '{Microsite_Conditions,site_surface_shape_code}'::text[] AS site_surface_shape_code,
                site_surface_shape_codes.code_description AS site_surface_shape,
                c_1.invasive_plant,
                c_1.biological_agent,
                c_1.historical_iapp_site_id,
                c_1.collection_type,
                c_1.plant_count,
                c_1.collection_method,
                c_1.start_time,
                c_1.stop_time,
                c_1.actual_agent_stage,
                c_1.actual_agent_count,
                c_1.estimated_agent_stage,
                c_1.estimated_agent_count,
                c_1.total_agent_quantity_actual,
                c_1.total_agent_quantity_estimated
              FROM collection_string_agg c_1
                JOIN biocontrol_collection_json b_1 ON b_1.activity_incoming_data_id = c_1.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header cloud_cover_code_header ON cloud_cover_code_header.code_header_title::text = 'cloud_cover_code'::text AND cloud_cover_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code cloud_cover_codes ON cloud_cover_codes.code_header_id = cloud_cover_code_header.code_header_id AND (b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[]) = cloud_cover_codes.code_name::text
                LEFT JOIN invasivesbc.code_header precipitation_code_header ON precipitation_code_header.code_header_title::text = 'precipitation_code'::text AND precipitation_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code precipitation_codes ON precipitation_codes.code_header_id = precipitation_code_header.code_header_id AND (b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[]) = precipitation_codes.code_name::text
                LEFT JOIN invasivesbc.code_header mesoslope_position_code_header ON mesoslope_position_code_header.code_header_title::text = 'mesoslope_position_code'::text AND mesoslope_position_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code mesoslope_position_codes ON mesoslope_position_codes.code_header_id = mesoslope_position_code_header.code_header_id AND (b_1.json_data #>> '{Microsite_Conditions,mesoslope_position_code}'::text[]) = mesoslope_position_codes.code_name::text
                LEFT JOIN invasivesbc.code_header site_surface_shape_code_header ON site_surface_shape_code_header.code_header_title::text = 'site_surface_shape_code'::text AND site_surface_shape_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code site_surface_shape_codes ON site_surface_shape_codes.code_header_id = site_surface_shape_code_header.code_header_id AND (b_1.json_data #>> '{Microsite_Conditions,site_surface_shape_code}'::text[]) = site_surface_shape_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND (b_1.json_data #>> '{Biocontrol_Collection_Information,invasive_plant_code}'::text[]) = invasive_plant_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biological_agent_code_header ON biological_agent_code_header.code_header_title::text = 'biological_agent_code'::text AND biological_agent_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_codes ON biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id AND (b_1.json_data #>> '{Biocontrol_Collection_Information,biological_agent_code}'::text[]) = biological_agent_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biological_agent_presence_code_header ON biological_agent_presence_code_header.code_header_title::text = 'biological_agent_presence_code'::text AND biological_agent_presence_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_presence_codes ON biological_agent_presence_codes.code_header_id = biological_agent_presence_code_header.code_header_id AND (b_1.json_data #>> '{Biocontrol_Collection_Information,biological_agent_presence_code}'::text[]) = biological_agent_presence_codes.code_name::text
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        c.jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.observation_person,
        b.temperature,
        b.cloud_cover,
        b.precipitation,
        b.wind_speed,
        b.wind_aspect,
        b.weather_comments,
        b.mesoslope_position,
        b.site_surface_shape,
        b.invasive_plant,
        b.biological_agent,
        b.collection_type,
        b.plant_count,
        b.collection_method,
        b.start_time,
        b.stop_time,
        b.actual_agent_stage,
        b.actual_agent_count,
        b.estimated_agent_stage,
        b.estimated_agent_count,
        b.total_agent_quantity_actual,
        b.total_agent_quantity_estimated,
        c.elevation,
        c.well_proximity,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        JOIN biocontrol_collection_monitoring_select b ON b.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Biocontrol_Collection'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.biocontrol_collection_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.biocontrol_collection_summary TO invasivebc;


    -- invasivesbc.biocontrol_dispersal_monitoring_summary source

    CREATE OR REPLACE VIEW invasivesbc.biocontrol_dispersal_monitoring_summary
    AS WITH biocontrol_dispersal_monitoring_json AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.form_status,
                activity_incoming_data.activity_payload #>> '{form_data,activity_type_data,linked_id}'::text[] AS linked_treatment_id,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data}'::text[] AS json_data
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), bioagent_location AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                convert_string_list_to_array_elements(activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_BiocontrolDispersal_Information,bio_agent_location_code}'::text[]) AS bio_agent_location_code
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), bioagent_location_code AS (
            SELECT b_1.activity_incoming_data_id,
                b_1.bio_agent_location_code,
                location_agents_found_codes.code_description AS location_agent_found
              FROM bioagent_location b_1
                LEFT JOIN invasivesbc.code_header location_agents_found_code_header ON location_agents_found_code_header.code_header_title::text = 'location_agents_found_code'::text AND location_agents_found_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code location_agents_found_codes ON location_agents_found_codes.code_header_id = location_agents_found_code_header.code_header_id AND b_1.bio_agent_location_code = location_agents_found_codes.code_name::text
            ), bioagent_location_agg AS (
            SELECT b_1.activity_incoming_data_id,
                string_agg(b_1.location_agent_found::text, ', '::text ORDER BY (b_1.location_agent_found::text)) AS location_agent_found
              FROM bioagent_location_code b_1
              GROUP BY b_1.activity_incoming_data_id
            ), actual_agents_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,Monitoring_BiocontrolDispersal_Information,actual_biological_agents}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), actual_agents_array_select AS (
            SELECT a.activity_incoming_data_id,
                a.json_array #>> '{biological_agent_stage_code}'::text[] AS actual_biological_agent_stage_code,
                biological_agent_stage_codes.code_description AS actual_biological_agent_stage,
                a.json_array #>> '{release_quantity}'::text[] AS actual_release_quantity,
                a.json_array #>> '{plant_position}'::text[] AS plant_position_code,
                plant_position_codes.code_description AS actual_plant_position,
                a.json_array #>> '{agent_location}'::text[] AS agent_location_code,
                biological_agent_stage_codes.code_description AS actual_agent_location
              FROM actual_agents_array a
                LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON biological_agent_stage_code_header.code_header_title::text = 'biological_agent_stage_code'::text AND biological_agent_stage_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_stage_codes ON biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id AND (a.json_array #>> '{biological_agent_stage_code}'::text[]) = biological_agent_stage_codes.code_name::text
                LEFT JOIN invasivesbc.code_header plant_position_code_header ON plant_position_code_header.code_header_title::text = 'plant_position_code'::text AND plant_position_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code plant_position_codes ON plant_position_codes.code_header_id = plant_position_code_header.code_header_id AND (a.json_array #>> '{plant_position}'::text[]) = plant_position_codes.code_name::text
                LEFT JOIN invasivesbc.code_header agent_location_code_header ON agent_location_code_header.code_header_title::text = 'agent_location_code'::text AND agent_location_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code agent_location_codes ON agent_location_codes.code_header_id = agent_location_code_header.code_header_id AND (a.json_array #>> '{agent_location}'::text[]) = agent_location_codes.code_name::text
            ), actual_bioagents_agg AS (
            SELECT b_1.activity_incoming_data_id,
                string_agg(b_1.actual_biological_agent_stage::text, ', '::text ORDER BY (b_1.actual_biological_agent_stage::text)) AS actual_biological_agent_stage,
                string_agg(b_1.actual_release_quantity, ', '::text ORDER BY b_1.actual_release_quantity) AS actual_release_quantity,
                string_agg(b_1.actual_plant_position::text, ', '::text ORDER BY (b_1.actual_plant_position::text)) AS actual_plant_position,
                string_agg(b_1.actual_agent_location::text, ', '::text ORDER BY (b_1.actual_agent_location::text)) AS actual_agent_location
              FROM actual_agents_array_select b_1
              GROUP BY b_1.activity_incoming_data_id
            ), estimated_agents_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,Monitoring_BiocontrolDispersal_Information,estimated_biological_agents}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), estimated_agents_array_select AS (
            SELECT e.activity_incoming_data_id,
                e.json_array #>> '{biological_agent_stage_code}'::text[] AS estimated_biological_agent_stage_code,
                biological_agent_stage_codes.code_description AS estimated_biological_agent_stage,
                e.json_array #>> '{release_quantity}'::text[] AS estimated_release_quantity,
                e.json_array #>> '{plant_position}'::text[] AS plant_position_code,
                plant_position_codes.code_description AS estimated_plant_position,
                e.json_array #>> '{agent_location}'::text[] AS agent_location_code,
                biological_agent_stage_codes.code_description AS estimated_agent_location
              FROM estimated_agents_array e
                LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON biological_agent_stage_code_header.code_header_title::text = 'biological_agent_stage_code'::text AND biological_agent_stage_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_stage_codes ON biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id AND (e.json_array #>> '{biological_agent_stage_code}'::text[]) = biological_agent_stage_codes.code_name::text
                LEFT JOIN invasivesbc.code_header plant_position_code_header ON plant_position_code_header.code_header_title::text = 'plant_position_code'::text AND plant_position_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code plant_position_codes ON plant_position_codes.code_header_id = plant_position_code_header.code_header_id AND (e.json_array #>> '{plant_position}'::text[]) = plant_position_codes.code_name::text
                LEFT JOIN invasivesbc.code_header agent_location_code_header ON agent_location_code_header.code_header_title::text = 'agent_location_code'::text AND agent_location_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code agent_location_codes ON agent_location_codes.code_header_id = agent_location_code_header.code_header_id AND (e.json_array #>> '{agent_location}'::text[]) = agent_location_codes.code_name::text
            ), estimated_bioagents_agg AS (
            SELECT e.activity_incoming_data_id,
                string_agg(e.estimated_biological_agent_stage::text, ', '::text ORDER BY (e.estimated_biological_agent_stage::text)) AS estimated_biological_agent_stage,
                string_agg(e.estimated_release_quantity, ', '::text ORDER BY e.estimated_release_quantity) AS estimated_release_quantity,
                string_agg(e.estimated_plant_position::text, ', '::text ORDER BY (e.estimated_plant_position::text)) AS estimated_plant_position,
                string_agg(e.estimated_agent_location::text, ', '::text ORDER BY (e.estimated_agent_location::text)) AS estimated_agent_location
              FROM estimated_agents_array_select e
              GROUP BY e.activity_incoming_data_id
            ), biocontrol_release_monitoring_select AS (
            SELECT b_1.activity_incoming_data_id,
                b_1.linked_treatment_id,
                b_1.json_data #>> '{Weather_Conditions,temperature}'::text[] AS temperature,
                b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[] AS cloud_cover_code,
                cloud_cover_codes.code_description AS cloud_cover,
                b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[] AS precipitation_code,
                precipitation_codes.code_description AS precipitation,
                b_1.json_data #>> '{Weather_Conditions,wind_speed}'::text[] AS wind_speed,
                b_1.json_data #>> '{Weather_Conditions,wind_aspect}'::text[] AS wind_aspect,
                b_1.json_data #>> '{Weather_Conditions,weather_comments}'::text[] AS weather_comments,
                b_1.json_data #>> '{Microsite_Conditions,mesoslope_position_code}'::text[] AS mesoslope_position_code,
                mesoslope_position_codes.code_description AS mesoslope_position,
                b_1.json_data #>> '{Microsite_Conditions,site_surface_shape_code}'::text[] AS site_surface_shape_code,
                site_surface_shape_codes.code_description AS site_surface_shape,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,invasive_plant_code}'::text[] AS invasive_plant_code,
                invasive_plant_codes.code_description AS invasive_plant,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,biological_agent_code}'::text[] AS biological_agent_code,
                biological_agent_codes.code_description AS biological_agent,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,biocontrol_present}'::text[] AS biocontrol_present,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,biological_agent_presence_code}'::text[] AS biological_agent_presence_code,
                biological_agent_presence_codes.code_description AS biological_agent_presence,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,monitoring_type}'::text[] AS monitoring_type,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,plant_count}'::text[] AS plant_count,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,biocontrol_monitoring_methods_code}'::text[] AS monitoring_method_code,
                biocontrol_monitoring_methods_codes.code_description AS monitoring_method,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,linear_segment}'::text[] AS linear_segment,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,start_time}'::text[] AS start_time,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,stop_time}'::text[] AS stop_time,
                l.location_agent_found,
                a.actual_biological_agent_stage,
                a.actual_release_quantity,
                a.actual_plant_position,
                a.actual_agent_location,
                e.estimated_biological_agent_stage,
                e.estimated_release_quantity,
                e.estimated_plant_position,
                e.estimated_agent_location,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,total_bio_agent_quantity_actual}'::text[] AS total_bio_agent_quantity_actual,
                b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,total_bio_agent_quantity_estimated}'::text[] AS total_bioagent_quantity_estimated,
                b_1.json_data #>> '{Target_Plant_Phenology,phenology_details_recorded}'::text[] AS phenology_details_recorded,
                translate(b_1.json_data #>> '{Target_Plant_Phenology,target_plant_heights}'::text[], '[{}]'::text, ''::text) AS target_plant_heights,
                b_1.json_data #>> '{Target_Plant_Phenology,winter_dormant}'::text[] AS winter_dormant,
                b_1.json_data #>> '{Target_Plant_Phenology,seedlings}'::text[] AS seedlings,
                b_1.json_data #>> '{Target_Plant_Phenology,rosettes}'::text[] AS rosettes,
                b_1.json_data #>> '{Target_Plant_Phenology,bolts}'::text[] AS bolts,
                b_1.json_data #>> '{Target_Plant_Phenology,flowering}'::text[] AS flowering,
                b_1.json_data #>> '{Target_Plant_Phenology,seeds_forming}'::text[] AS seeds_forming,
                b_1.json_data #>> '{Target_Plant_Phenology,senescent}'::text[] AS senescent
              FROM biocontrol_dispersal_monitoring_json b_1
                FULL JOIN actual_bioagents_agg a ON a.activity_incoming_data_id = b_1.activity_incoming_data_id
                FULL JOIN estimated_bioagents_agg e ON e.activity_incoming_data_id = b_1.activity_incoming_data_id
                FULL JOIN bioagent_location_agg l ON l.activity_incoming_data_id = b_1.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header cloud_cover_code_header ON cloud_cover_code_header.code_header_title::text = 'cloud_cover_code'::text AND cloud_cover_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code cloud_cover_codes ON cloud_cover_codes.code_header_id = cloud_cover_code_header.code_header_id AND (b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[]) = cloud_cover_codes.code_name::text
                LEFT JOIN invasivesbc.code_header precipitation_code_header ON precipitation_code_header.code_header_title::text = 'precipitation_code'::text AND precipitation_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code precipitation_codes ON precipitation_codes.code_header_id = precipitation_code_header.code_header_id AND (b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[]) = precipitation_codes.code_name::text
                LEFT JOIN invasivesbc.code_header mesoslope_position_code_header ON mesoslope_position_code_header.code_header_title::text = 'mesoslope_position_code'::text AND mesoslope_position_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code mesoslope_position_codes ON mesoslope_position_codes.code_header_id = mesoslope_position_code_header.code_header_id AND (b_1.json_data #>> '{Microsite_Conditions,mesoslope_position_code}'::text[]) = mesoslope_position_codes.code_name::text
                LEFT JOIN invasivesbc.code_header site_surface_shape_code_header ON site_surface_shape_code_header.code_header_title::text = 'site_surface_shape_code'::text AND site_surface_shape_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code site_surface_shape_codes ON site_surface_shape_codes.code_header_id = site_surface_shape_code_header.code_header_id AND (b_1.json_data #>> '{Microsite_Conditions,site_surface_shape_code}'::text[]) = site_surface_shape_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND (b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,invasive_plant_code}'::text[]) = invasive_plant_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biological_agent_code_header ON biological_agent_code_header.code_header_title::text = 'biological_agent_code'::text AND biological_agent_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_codes ON biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id AND (b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,biological_agent_code}'::text[]) = biological_agent_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biological_agent_presence_code_header ON biological_agent_presence_code_header.code_header_title::text = 'biological_agent_presence_code'::text AND biological_agent_presence_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_presence_codes ON biological_agent_presence_codes.code_header_id = biological_agent_presence_code_header.code_header_id AND (b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,biological_agent_presence_code}'::text[]) = biological_agent_presence_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biocontrol_monitoring_methods_code_header ON biocontrol_monitoring_methods_code_header.code_header_title::text = 'biocontrol_monitoring_methods_code'::text AND biocontrol_monitoring_methods_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biocontrol_monitoring_methods_codes ON biocontrol_monitoring_methods_codes.code_header_id = biocontrol_monitoring_methods_code_header.code_header_id AND (b_1.json_data #>> '{Monitoring_BiocontrolDispersal_Information,biocontrol_monitoring_methods_code}'::text[]) = biocontrol_monitoring_methods_codes.code_name::text
              WHERE (b_1.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND b_1.activity_subtype::text = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'::text
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        c.jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.observation_person,
        b.linked_treatment_id,
        b.temperature,
        b.cloud_cover,
        b.precipitation,
        b.wind_speed,
        b.wind_aspect,
        b.weather_comments,
        b.mesoslope_position,
        b.site_surface_shape,
        b.invasive_plant,
        b.biological_agent,
        b.biocontrol_present,
        b.biological_agent_presence,
        b.monitoring_type,
        b.plant_count,
        b.monitoring_method,
        b.linear_segment,
        b.start_time,
        b.stop_time,
        b.location_agent_found,
        b.actual_biological_agent_stage,
        b.actual_release_quantity,
        b.actual_plant_position,
        b.actual_agent_location,
        b.estimated_biological_agent_stage,
        b.estimated_release_quantity,
        b.estimated_plant_position,
        b.estimated_agent_location,
        b.total_bio_agent_quantity_actual,
        b.total_bioagent_quantity_estimated,
        b.phenology_details_recorded,
        b.target_plant_heights,
        b.winter_dormant,
        b.seedlings,
        b.rosettes,
        b.bolts,
        b.flowering,
        b.seeds_forming,
        b.senescent,
        c.elevation,
        c.well_proximity,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        JOIN biocontrol_release_monitoring_select b ON b.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.biocontrol_dispersal_monitoring_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.biocontrol_dispersal_monitoring_summary TO invasivebc;


    -- invasivesbc.biocontrol_release_monitoring_summary source

    CREATE OR REPLACE VIEW invasivesbc.biocontrol_release_monitoring_summary
    AS WITH biocontrol_release_monitoring_json AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.form_status,
                activity_incoming_data.activity_payload #>> '{form_data,activity_type_data,linked_id}'::text[] AS linked_treatment_id,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data}'::text[] AS json_data
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), actual_agents_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,Monitoring_BiocontrolRelease_TerrestrialPlant_Information,actual_biological_agents}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), actual_agents_array_select AS (
            SELECT a.activity_incoming_data_id,
                a.json_array #>> '{biological_agent_stage_code}'::text[] AS actual_biological_agent_stage_code,
                biological_agent_stage_codes.code_description AS actual_biological_agent_stage,
                a.json_array #>> '{release_quantity}'::text[] AS actual_release_quantity,
                a.json_array #>> '{agent_location}'::text[] AS actual_agent_location_code,
                agent_location_codes.code_description AS actual_agent_location,
                a.json_array #>> '{plant_position}'::text[] AS actual_plant_position_code,
                plant_position_codes.code_description AS actual_plant_position
              FROM actual_agents_array a
                LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON biological_agent_stage_code_header.code_header_title::text = 'biological_agent_stage_code'::text AND biological_agent_stage_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_stage_codes ON biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id AND (a.json_array #>> '{biological_agent_stage_code}'::text[]) = biological_agent_stage_codes.code_name::text
                LEFT JOIN invasivesbc.code_header agent_location_code_header ON agent_location_code_header.code_header_title::text = 'agent_location_code'::text AND agent_location_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code agent_location_codes ON agent_location_codes.code_header_id = agent_location_code_header.code_header_id AND (a.json_array #>> '{agent_location}'::text[]) = agent_location_codes.code_name::text
                LEFT JOIN invasivesbc.code_header plant_position_code_header ON plant_position_code_header.code_header_title::text = 'plant_position_code'::text AND plant_position_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code plant_position_codes ON plant_position_codes.code_header_id = plant_position_code_header.code_header_id AND (a.json_array #>> '{plant_position}'::text[]) = plant_position_codes.code_name::text
            ), actual_bioagents_agg AS (
            SELECT b_1.activity_incoming_data_id,
                string_agg(b_1.actual_biological_agent_stage::text, ', '::text ORDER BY (b_1.actual_biological_agent_stage::text)) AS actual_biological_agent_stage,
                string_agg(b_1.actual_release_quantity, ', '::text ORDER BY b_1.actual_release_quantity) AS actual_release_quantity
              FROM actual_agents_array_select b_1
              GROUP BY b_1.activity_incoming_data_id
            ), estimated_agents_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,Monitoring_BiocontrolRelease_TerrestrialPlant_Information,estimated_biological_agents}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), estimated_agents_array_select AS (
            SELECT e.activity_incoming_data_id,
                e.json_array #>> '{biological_agent_stage_code}'::text[] AS estimated_biological_agent_stage_code,
                biological_agent_stage_codes.code_description AS estimated_biological_agent_stage,
                e.json_array #>> '{release_quantity}'::text[] AS estimated_release_quantity,
                e.json_array #>> '{agent_location}'::text[] AS estimated_agent_location_code,
                agent_location_codes.code_description AS estimated_agent_location,
                e.json_array #>> '{plant_position}'::text[] AS estimated_plant_position_code,
                plant_position_codes.code_description AS estimated_plant_position
              FROM estimated_agents_array e
                LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON biological_agent_stage_code_header.code_header_title::text = 'biological_agent_stage_code'::text AND biological_agent_stage_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_stage_codes ON biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id AND (e.json_array #>> '{biological_agent_stage_code}'::text[]) = biological_agent_stage_codes.code_name::text
                LEFT JOIN invasivesbc.code_header agent_location_code_header ON agent_location_code_header.code_header_title::text = 'agent_location_code'::text AND agent_location_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code agent_location_codes ON agent_location_codes.code_header_id = agent_location_code_header.code_header_id AND (e.json_array #>> '{agent_location}'::text[]) = agent_location_codes.code_name::text
                LEFT JOIN invasivesbc.code_header plant_position_code_header ON plant_position_code_header.code_header_title::text = 'plant_position_code'::text AND plant_position_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code plant_position_codes ON plant_position_codes.code_header_id = plant_position_code_header.code_header_id AND (e.json_array #>> '{plant_position}'::text[]) = plant_position_codes.code_name::text
            ), estimated_bioagents_agg AS (
            SELECT e.activity_incoming_data_id,
                string_agg(e.estimated_biological_agent_stage::text, ', '::text ORDER BY (e.estimated_biological_agent_stage::text)) AS estimated_biological_agent_stage,
                string_agg(e.estimated_release_quantity, ', '::text ORDER BY e.estimated_release_quantity) AS estimated_release_quantity
              FROM estimated_agents_array_select e
              GROUP BY e.activity_incoming_data_id
            ), biocontrol_release_monitoring_select AS (
            SELECT b_1.activity_incoming_data_id,
                b_1.linked_treatment_id,
                b_1.json_data #>> '{Weather_Conditions,temperature}'::text[] AS temperature,
                b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[] AS cloud_cover_code,
                cloud_cover_codes.code_description AS cloud_cover,
                b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[] AS precipitation_code,
                precipitation_codes.code_description AS precipitation,
                b_1.json_data #>> '{Weather_Conditions,wind_speed}'::text[] AS wind_speed,
                b_1.json_data #>> '{Weather_Conditions,wind_aspect}'::text[] AS wind_aspect,
                b_1.json_data #>> '{Weather_Conditions,weather_comments}'::text[] AS weather_comments,
                b_1.json_data #>> '{Microsite_Conditions,mesoslope_position_code}'::text[] AS mesoslope_position_code,
                mesoslope_position_codes.code_description AS mesoslope_position,
                b_1.json_data #>> '{Microsite_Conditions,site_surface_shape_code}'::text[] AS site_surface_shape_code,
                site_surface_shape_codes.code_description AS site_surface_shape,
                b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,invasive_plant_code}'::text[] AS invasive_plant_code,
                invasive_plant_codes.code_description AS invasive_plant,
                b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,biological_agent_code}'::text[] AS biological_agent_code,
                biological_agent_codes.code_description AS biological_agent,
                b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,biocontrol_present}'::text[] AS biocontrol_present,
                b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,biological_agent_presence_code}'::text[] AS biological_agent_presence_code,
                biological_agent_presence_codes.code_description AS biological_agent_presence,
                b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,monitoring_type}'::text[] AS monitoring_type,
                b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,plant_count}'::text[] AS plant_count,
                b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,biocontrol_monitoring_methods_code}'::text[] AS monitoring_method_code,
                biocontrol_monitoring_methods_codes.code_description AS monitoring_method,
                b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,start_time}'::text[] AS start_time,
                b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,stop_time}'::text[] AS stop_time,
                a.actual_biological_agent_stage,
                a.actual_release_quantity,
                e.estimated_biological_agent_stage,
                e.estimated_release_quantity,
                b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,total_bio_agent_quantity_actual}'::text[] AS total_bio_agent_quantity_actual,
                b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,total_bio_agent_quantity_estimated}'::text[] AS total_bio_agent_quantity_estimated,
                b_1.json_data #>> '{Target_Plant_Phenology,phenology_details_recorded}'::text[] AS phenology_details_recorded,
                translate(b_1.json_data #>> '{Target_Plant_Phenology,target_plant_heights}'::text[], '[{}]'::text, ''::text) AS target_plant_heights_cm,
                b_1.json_data #>> '{Target_Plant_Phenology,winter_dormant}'::text[] AS winter_dormant,
                b_1.json_data #>> '{Target_Plant_Phenology,seedlings}'::text[] AS seedlings,
                b_1.json_data #>> '{Target_Plant_Phenology,rosettes}'::text[] AS rosettes,
                b_1.json_data #>> '{Target_Plant_Phenology,bolts}'::text[] AS bolts,
                b_1.json_data #>> '{Target_Plant_Phenology,flowering}'::text[] AS flowering,
                b_1.json_data #>> '{Target_Plant_Phenology,seeds_forming}'::text[] AS seeds_forming,
                b_1.json_data #>> '{Target_Plant_Phenology,senescent}'::text[] AS senescent,
                b_1.json_data #>> '{Spread_Results,spread_details_recorded}'::text[] AS spread_details_recorded,
                b_1.json_data #>> '{Spread_Results,agent_density}'::text[] AS agent_density,
                b_1.json_data #>> '{Spread_Results,plant_attack}'::text[] AS plant_attack,
                b_1.json_data #>> '{Spread_Results,max_spread_distance}'::text[] AS max_spread_distance,
                b_1.json_data #>> '{Spread_Results,max_spread_aspect}'::text[] AS max_spread_aspect
              FROM biocontrol_release_monitoring_json b_1
                FULL JOIN actual_bioagents_agg a ON a.activity_incoming_data_id = b_1.activity_incoming_data_id
                FULL JOIN estimated_bioagents_agg e ON e.activity_incoming_data_id = b_1.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header cloud_cover_code_header ON cloud_cover_code_header.code_header_title::text = 'cloud_cover_code'::text AND cloud_cover_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code cloud_cover_codes ON cloud_cover_codes.code_header_id = cloud_cover_code_header.code_header_id AND (b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[]) = cloud_cover_codes.code_name::text
                LEFT JOIN invasivesbc.code_header precipitation_code_header ON precipitation_code_header.code_header_title::text = 'precipitation_code'::text AND precipitation_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code precipitation_codes ON precipitation_codes.code_header_id = precipitation_code_header.code_header_id AND (b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[]) = precipitation_codes.code_name::text
                LEFT JOIN invasivesbc.code_header mesoslope_position_code_header ON mesoslope_position_code_header.code_header_title::text = 'mesoslope_position_code'::text AND mesoslope_position_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code mesoslope_position_codes ON mesoslope_position_codes.code_header_id = mesoslope_position_code_header.code_header_id AND (b_1.json_data #>> '{Microsite_Conditions,mesoslope_position_code}'::text[]) = mesoslope_position_codes.code_name::text
                LEFT JOIN invasivesbc.code_header site_surface_shape_code_header ON site_surface_shape_code_header.code_header_title::text = 'site_surface_shape_code'::text AND site_surface_shape_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code site_surface_shape_codes ON site_surface_shape_codes.code_header_id = site_surface_shape_code_header.code_header_id AND (b_1.json_data #>> '{Microsite_Conditions,site_surface_shape_code}'::text[]) = site_surface_shape_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND (b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,invasive_plant_code}'::text[]) = invasive_plant_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biological_agent_code_header ON biological_agent_code_header.code_header_title::text = 'biological_agent_code'::text AND biological_agent_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_codes ON biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id AND (b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,biological_agent_code}'::text[]) = biological_agent_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biological_agent_presence_code_header ON biological_agent_presence_code_header.code_header_title::text = 'biological_agent_presence_code'::text AND biological_agent_presence_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_presence_codes ON biological_agent_presence_codes.code_header_id = biological_agent_presence_code_header.code_header_id AND (b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,biological_agent_presence_code}'::text[]) = biological_agent_presence_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biocontrol_monitoring_methods_code_header ON biocontrol_monitoring_methods_code_header.code_header_title::text = 'biocontrol_monitoring_methods_code'::text AND biocontrol_monitoring_methods_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biocontrol_monitoring_methods_codes ON biocontrol_monitoring_methods_codes.code_header_id = biocontrol_monitoring_methods_code_header.code_header_id AND (b_1.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information,biocontrol_monitoring_methods_code}'::text[]) = biocontrol_monitoring_methods_codes.code_name::text
              WHERE (b_1.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND b_1.activity_subtype::text = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'::text
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        c.jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.observation_person,
        b.linked_treatment_id,
        b.temperature,
        b.cloud_cover,
        b.precipitation,
        b.wind_speed,
        b.wind_aspect,
        b.weather_comments,
        b.mesoslope_position,
        b.site_surface_shape,
        b.invasive_plant,
        b.biological_agent,
        b.biocontrol_present,
        b.biological_agent_presence,
        b.monitoring_type,
        b.plant_count,
        b.monitoring_method,
        b.start_time,
        b.stop_time,
        b.actual_biological_agent_stage,
        b.actual_release_quantity,
        b.estimated_biological_agent_stage,
        b.estimated_release_quantity,
        b.total_bio_agent_quantity_actual,
        b.total_bio_agent_quantity_estimated,
        b.phenology_details_recorded,
        b.target_plant_heights_cm,
        b.winter_dormant,
        b.seedlings,
        b.rosettes,
        b.bolts,
        b.flowering,
        b.seeds_forming,
        b.senescent,
        b.spread_details_recorded,
        b.agent_density,
        b.plant_attack,
        b.max_spread_distance,
        b.max_spread_aspect,
        c.elevation,
        c.well_proximity,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        JOIN biocontrol_release_monitoring_select b ON b.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.biocontrol_release_monitoring_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.biocontrol_release_monitoring_summary TO invasivebc;


    -- invasivesbc.biocontrol_release_summary source

    CREATE OR REPLACE VIEW invasivesbc.biocontrol_release_summary
    AS WITH biocontrol_release_json AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.form_status,
                activity_incoming_data.activity_payload #>> '{form_data,activity_type_data,linked_id}'::text[] AS linked_treatment_id,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data}'::text[] AS json_data
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), actual_bio_agents_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,Biocontrol_Release_Information,actual_biological_agents}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), estimated_bio_agents_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,Biocontrol_Release_Information,estimated_biological_agents}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), estimated_bio_agents_array_select AS (
            SELECT a.activity_incoming_data_id,
                a.json_array #>> '{biological_agent_stage_code}'::text[] AS biological_agent_stage_code,
                biological_agent_stage_codes.code_description AS biological_agent_stage,
                a.json_array #>> '{release_quantity}'::text[] AS release_quantity
              FROM estimated_bio_agents_array a
                LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON biological_agent_stage_code_header.code_header_title::text = 'biological_agent_stage_code'::text AND biological_agent_stage_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_stage_codes ON biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id AND (a.json_array #>> '{biological_agent_stage_code}'::text[]) = biological_agent_stage_codes.code_name::text
            ), actual_bio_agents_array_select AS (
            SELECT a.activity_incoming_data_id,
                a.json_array #>> '{biological_agent_stage_code}'::text[] AS biological_agent_stage_code,
                biological_agent_stage_codes.code_description AS biological_agent_stage,
                a.json_array #>> '{release_quantity}'::text[] AS release_quantity
              FROM actual_bio_agents_array a
                LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON biological_agent_stage_code_header.code_header_title::text = 'biological_agent_stage_code'::text AND biological_agent_stage_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_stage_codes ON biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id AND (a.json_array #>> '{biological_agent_stage_code}'::text[]) = biological_agent_stage_codes.code_name::text
            ), estimated_bio_agents_agg AS (
            SELECT b_1.activity_incoming_data_id,
                string_agg(b_1.biological_agent_stage::text, ', '::text ORDER BY (b_1.biological_agent_stage::text)) AS estimated_biological_agent_stage,
                string_agg(b_1.release_quantity, ', '::text ORDER BY b_1.release_quantity) AS estimated_release_quantity
              FROM estimated_bio_agents_array_select b_1
              GROUP BY b_1.activity_incoming_data_id
            ), actual_bio_agents_agg AS (
            SELECT b_1.activity_incoming_data_id,
                string_agg(b_1.biological_agent_stage::text, ', '::text ORDER BY (b_1.biological_agent_stage::text)) AS actual_biological_agent_stage,
                string_agg(b_1.release_quantity, ', '::text ORDER BY b_1.release_quantity) AS actual_release_quantity
              FROM actual_bio_agents_array_select b_1
              GROUP BY b_1.activity_incoming_data_id
            ), biocontrol_release_json_select AS (
            SELECT b_1.activity_incoming_data_id,
                b_1.linked_treatment_id,
                b_1.json_data #>> '{Weather_Conditions,temperature}'::text[] AS temperature,
                b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[] AS cloud_cover_code,
                cloud_cover_codes.code_description AS cloud_cover,
                b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[] AS precipitation_code,
                precipitation_codes.code_description AS precipitation,
                b_1.json_data #>> '{Weather_Conditions,wind_speed}'::text[] AS wind_speed,
                b_1.json_data #>> '{Weather_Conditions,wind_aspect}'::text[] AS wind_aspect,
                b_1.json_data #>> '{Weather_Conditions,weather_comments}'::text[] AS weather_comments,
                b_1.json_data #>> '{Microsite_Conditions,mesoslope_position_code}'::text[] AS mesoslope_position_code,
                mesoslope_position_codes.code_description AS mesoslope_position,
                b_1.json_data #>> '{Microsite_Conditions,site_surface_shape_code}'::text[] AS site_surface_shape_code,
                site_surface_shape_codes.code_description AS site_surface_shape,
                b_1.json_data #>> '{Biocontrol_Release_Information,invasive_plant_code}'::text[] AS invasive_plant_code,
                invasive_plant_codes.code_description AS invasive_plant,
                b_1.json_data #>> '{Biocontrol_Release_Information,biological_agent_code}'::text[] AS biological_agent_code,
                biological_agent_codes.code_description AS biological_agent,
                b_1.json_data #>> '{Biocontrol_Release_Information,linear_segment}'::text[] AS linear_segment,
                a.actual_biological_agent_stage,
                a.actual_release_quantity,
                e.estimated_biological_agent_stage,
                e.estimated_release_quantity,
                b_1.json_data #>> '{Biocontrol_Release_Information,total_bio_agent_quantity_actual}'::text[] AS total_release_quantity_actual,
                b_1.json_data #>> '{Biocontrol_Release_Information,total_bio_agent_quantity_estimated}'::text[] AS total_release_quantity_estimated
              FROM biocontrol_release_json b_1
                JOIN estimated_bio_agents_agg e ON e.activity_incoming_data_id = b_1.activity_incoming_data_id
                JOIN actual_bio_agents_agg a ON a.activity_incoming_data_id = b_1.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header cloud_cover_code_header ON cloud_cover_code_header.code_header_title::text = 'cloud_cover_code'::text AND cloud_cover_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code cloud_cover_codes ON cloud_cover_codes.code_header_id = cloud_cover_code_header.code_header_id AND (b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[]) = cloud_cover_codes.code_name::text
                LEFT JOIN invasivesbc.code_header precipitation_code_header ON precipitation_code_header.code_header_title::text = 'precipitation_code'::text AND precipitation_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code precipitation_codes ON precipitation_codes.code_header_id = precipitation_code_header.code_header_id AND (b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[]) = precipitation_codes.code_name::text
                LEFT JOIN invasivesbc.code_header mesoslope_position_code_header ON mesoslope_position_code_header.code_header_title::text = 'mesoslope_position_code'::text AND mesoslope_position_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code mesoslope_position_codes ON mesoslope_position_codes.code_header_id = mesoslope_position_code_header.code_header_id AND (b_1.json_data #>> '{Microsite_Conditions,mesoslope_position_code}'::text[]) = mesoslope_position_codes.code_name::text
                LEFT JOIN invasivesbc.code_header site_surface_shape_code_header ON site_surface_shape_code_header.code_header_title::text = 'site_surface_shape_code'::text AND site_surface_shape_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code site_surface_shape_codes ON site_surface_shape_codes.code_header_id = site_surface_shape_code_header.code_header_id AND (b_1.json_data #>> '{Microsite_Conditions,site_surface_shape_code}'::text[]) = site_surface_shape_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND (b_1.json_data #>> '{Biocontrol_Release_Information,invasive_plant_code}'::text[]) = invasive_plant_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biological_agent_code_header ON biological_agent_code_header.code_header_title::text = 'biological_agent_code'::text AND biological_agent_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_codes ON biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id AND (b_1.json_data #>> '{Biocontrol_Release_Information,biological_agent_code}'::text[]) = biological_agent_codes.code_name::text
                LEFT JOIN invasivesbc.code_header biological_agent_presence_code_header ON biological_agent_presence_code_header.code_header_title::text = 'biological_agent_presence_code'::text AND biological_agent_presence_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code biological_agent_presence_codes ON biological_agent_presence_codes.code_header_id = biological_agent_presence_code_header.code_header_id AND (b_1.json_data #>> '{Biocontrol_Release_Information,biological_agent_presence_code}'::text[]) = biological_agent_presence_codes.code_name::text
                LEFT JOIN invasivesbc.code_header monitoring_method_code_header ON monitoring_method_code_header.code_header_title::text = 'monitoring_method_code'::text AND monitoring_method_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code monitoring_method_codes ON monitoring_method_codes.code_header_id = monitoring_method_code_header.code_header_id AND (b_1.json_data #>> '{Biocontrol_Release_Information,monitoring_method_code}'::text[]) = monitoring_method_codes.code_name::text
              WHERE (b_1.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND b_1.activity_subtype::text = 'Activity_Biocontrol_Release'::text
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        c.jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.observation_person,
        b.activity_incoming_data_id AS bio_activity_incoming_data_id,
        b.temperature,
        b.cloud_cover,
        b.precipitation,
        b.wind_speed,
        b.wind_aspect,
        b.weather_comments,
        b.mesoslope_position,
        b.site_surface_shape,
        b.invasive_plant,
        b.biological_agent,
        b.linear_segment,
        b.actual_biological_agent_stage,
        b.actual_release_quantity,
        b.estimated_biological_agent_stage,
        b.estimated_release_quantity,
        b.total_release_quantity_actual,
        b.total_release_quantity_estimated,
        c.elevation,
        c.well_proximity,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        JOIN biocontrol_release_json_select b ON b.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Biocontrol_Release'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.biocontrol_release_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.biocontrol_release_summary TO invasivebc;


    -- invasivesbc.chemical_treatment_monitoring_summary source

    CREATE OR REPLACE VIEW invasivesbc.chemical_treatment_monitoring_summary
    AS WITH invasive_plants_on_site AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                convert_string_list_to_array_elements(activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,invasive_plants_on_site}'::text[]) AS invasive_plants_on_site_code
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), invasive_plants_on_site_select AS (
            SELECT i.activity_incoming_data_id,
                i.invasive_plants_on_site_code,
                monitoring_evidence_codes.code_description AS invasive_plants_on_site
              FROM invasive_plants_on_site i
                LEFT JOIN invasivesbc.code_header monitoring_evidence_code_header ON monitoring_evidence_code_header.code_header_title::text = 'monitoring_evidence_code'::text AND monitoring_evidence_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code monitoring_evidence_codes ON monitoring_evidence_codes.code_header_id = monitoring_evidence_code_header.code_header_id AND i.invasive_plants_on_site_code = monitoring_evidence_codes.code_name::text
            ), invasive_plants_on_site_agg AS (
            SELECT i.activity_incoming_data_id,
                string_agg(i.invasive_plants_on_site::text, ', '::text ORDER BY (i.invasive_plants_on_site::text)) AS invasive_plants_on_site
              FROM invasive_plants_on_site_select i
              GROUP BY i.activity_incoming_data_id
            ), chemical_monitoring_json AS (
            SELECT a.activity_incoming_data_id,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,invasive_plant_code}'::text[] AS terrestrial_invasive_plant_code,
                invasive_plant_codes.code_description AS terrestrial_invasive_plant,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,invasive_plant_aquatic_code}'::text[] AS aquatic_invasive_plant_code,
                invasive_plant_aquatic_codes.code_description AS aquatic_invasive_plant,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,monitoring_details}'::text[] AS efficacy_comments,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,efficacy_code}'::text[] AS treatment_efficacy_rating_code,
                efficacy_codes.code_description AS treatment_efficacy_rating,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,management_efficacy_rating}'::text[] AS management_efficacy_rating_code,
                management_efficacy_codes.code_description AS management_efficacy_rating,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,evidence_of_treatment}'::text[] AS evidence_of_treatment,
                i.invasive_plants_on_site,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,treatment_pass}'::text[] AS treatment_pass,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,comment}'::text[] AS comment
              FROM invasivesbc.activity_incoming_data a
                JOIN invasive_plants_on_site_agg i ON i.activity_incoming_data_id = a.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND (a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,invasive_plant_code}'::text[]) = invasive_plant_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON invasive_plant_aquatic_code_header.code_header_title::text = 'invasive_plant_aquatic_code'::text AND invasive_plant_aquatic_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id AND (a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,invasive_plant_aquatic_code}'::text[]) = invasive_plant_aquatic_codes.code_name::text
                LEFT JOIN invasivesbc.code_header efficacy_code_header ON efficacy_code_header.code_header_title::text = 'efficacy_code'::text AND efficacy_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code efficacy_codes ON efficacy_codes.code_header_id = efficacy_code_header.code_header_id AND (a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,efficacy_code}'::text[]) = efficacy_codes.code_name::text
                LEFT JOIN invasivesbc.code_header management_efficacy_code_header ON management_efficacy_code_header.code_header_title::text = 'management_efficacy_code'::text AND management_efficacy_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code management_efficacy_codes ON management_efficacy_codes.code_header_id = management_efficacy_code_header.code_header_id AND (a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information,management_efficacy_rating}'::text[]) = management_efficacy_codes.code_name::text
              WHERE (a.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        c.jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.observation_person,
        COALESCE(j.terrestrial_invasive_plant, j.aquatic_invasive_plant) AS invasive_plant,
        j.efficacy_comments,
        j.treatment_efficacy_rating,
        j.management_efficacy_rating,
        j.evidence_of_treatment,
        j.invasive_plants_on_site,
        j.treatment_pass,
        j.comment AS monitor_comment,
        c.elevation,
        c.well_proximity,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        LEFT JOIN chemical_monitoring_json j ON j.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.chemical_treatment_monitoring_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.chemical_treatment_monitoring_summary TO invasivebc;

    -- Permissions

    ALTER TABLE invasivesbc.common_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.common_summary TO invasivebc;


    -- invasivesbc.embedded_reports_view source

    CREATE OR REPLACE VIEW invasivesbc.embedded_reports_view
    AS SELECT r.id,
        r.metabase_resource,
        r.metabase_id,
        r.display_name AS name,
        c.name AS category
      FROM invasivesbc.embedded_reports r
        JOIN invasivesbc.embedded_report_categories c ON r.category_id = c.id
      WHERE r.enabled IS TRUE
      ORDER BY c.sort_order, c.name, r.sort_order, r.display_name;

    -- Permissions

    ALTER TABLE invasivesbc.embedded_reports_view OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.embedded_reports_view TO invasivebc;

    -- invasivesbc.iapp_site_summary_slow source

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
                WHEN ds.max_survey IS NULL THEN false
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

    -- invasivesbc.iapp_site_summary source

    CREATE MATERIALIZED VIEW invasivesbc.iapp_site_summary
    TABLESPACE pg_default
    AS WITH jurisdiction_data AS (
            SELECT DISTINCT regexp_split_to_array(survey_extract.jurisdictions::text, '($1<=)(, )'::text) AS jurisdictions,
                survey_extract.estimated_area_hectares,
                survey_extract.site_id
              FROM invasivesbc.survey_extract
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
        jd.estimated_area_hectares AS reported_area,
        string_to_array(i.all_species_on_site::text, ', '::text) AS all_species_on_site_as_array
      FROM invasivesbc.iapp_site_summary_slow i
        JOIN jurisdiction_data jd ON i.site_id = jd.site_id
      WHERE 1 = 1
    WITH DATA;

    -- Permissions

    ALTER TABLE invasivesbc.iapp_site_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.iapp_site_summary TO invasivebc;


    -- invasivesbc.iapp_site_summary_and_geojson source

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
        json_build_object('type', 'Feature', 'properties', json_build_object('site_id', i.site_id, 'species', i.all_species_on_site, 'has_surveys', i.has_surveys, 'has_biological_treatments', i.has_biological_treatments, 'has_biological_monitorings', i.has_biological_treatment_monitorings, 'has_biological_dispersals', i.has_biological_dispersals, 'has_chemical_treatments', i.has_chemical_treatments, 'has_chemical_monitorings', i.has_chemical_treatment_monitorings, 'has_mechanical_treatments', i.has_mechanical_treatments, 'has_mechanical_monitorings', i.has_mechanical_treatment_monitorings, 'earliest_survey', i.min_survey, 'latest_survey', i.max_survey, 'earliest_chemical_treatment', i.min_chemical_treatment_dates, 'latest_chemical_treatment', i.max_chemical_treatment_dates, 'earliest_chemical_monitoring', i.min_chemical_treatment_monitoring_dates, 'latest_chemical_monitoring', i.max_chemical_treatment_monitoring_dates, 'earliest_bio_dispersal', i.min_bio_dispersal_dates, 'latest_bio_dispersal', i.max_bio_dispersal_dates, 'earliest_bio_treatment', i.min_bio_treatment_dates, 'latest_bio_treatment', i.max_bio_treatment_dates, 'earliest_bio_monitoring', i.min_bio_treatment_monitoring_dates, 'latest_bio_monitoring', i.max_bio_treatment_monitoring_dates, 'earliest_mechanical_treatment', i.min_mechanical_treatment_dates, 'latest_mechanical_treatment', i.max_mechanical_treatment_dates, 'earliest_mechanical_monitoring', i.min_mechanical_treatment_monitoring_dates, 'latest_mechanical_monitoring', i.max_mechanical_treatment_monitoring_dates, 'reported_area', i.reported_area, 'jurisdictions', i.jurisdictions), 'geometry', st_asgeojson(s.geog)::jsonb) AS geojson
      FROM invasivesbc.iapp_site_summary i
        JOIN invasivesbc.iapp_spatial s ON i.site_id = s.site_id
      WHERE 1 = 1
    WITH DATA;

    -- Permissions

    ALTER TABLE invasivesbc.iapp_site_summary_and_geojson OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.iapp_site_summary_and_geojson TO invasivebc;


    -- invasivesbc.iapp_site_summary_slow source

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
                WHEN ds.max_survey IS NULL THEN false
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

    -- Permissions

    ALTER TABLE invasivesbc.iapp_site_summary_slow OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.iapp_site_summary_slow TO invasivebc;


    -- invasivesbc.iapp_species_ref_raw source

    -- CREATE OR REPLACE VIEW invasivesbc.iapp_species_ref_raw
    -- AS WITH all_plant_codes AS (
    --        SELECT c_1.code_id,
    --            c_1.code_description,
    --            c_1.code_name,
    --            ch.code_header_name,
    --            c_1.code_header_id
    --          FROM invasivesbc.code c_1
    --            JOIN invasivesbc.code_header ch ON c_1.code_header_id = ch.code_header_id
    --          WHERE ch.code_header_name::text = ANY (ARRAY['invasive_plant_code'::character varying, 'invasive_plant_code_withbiocontrol'::character varying, 'invasive_plant_aquatic_code'::character varying]::text[])
    --        )
    -- SELECT c.code_id,
    --    c.code_header_id,
    --    n.common_name,
    --    n.latin_name,
    --    n.genus,
    --    n.species,
    --    n.map_symbol
    -- FROM invasivesbc.species_ref_raw n
    --    JOIN all_plant_codes c ON c.code_name::text = n.map_symbol::text;

    -- Permissions

    -- ALTER TABLE invasivesbc.iapp_species_ref_raw OWNER TO invasivebc;
    -- GRANT ALL ON TABLE invasivesbc.iapp_species_ref_raw TO invasivebc;


    -- invasivesbc.iapp_species_status source

    CREATE OR REPLACE VIEW invasivesbc.iapp_species_status
    AS WITH most_recent_positive_occurences AS (
            SELECT se.site_id,
                max(se.survey_date) AS positive_occurrence_date,
                se.invasive_plant
              FROM invasivesbc.survey_extract se
              WHERE se.estimated_area_hectares > 0::numeric
              GROUP BY se.site_id, se.invasive_plant
            ), most_recent_negative_occurrences AS (
            SELECT se.site_id,
                max(se.survey_date) AS negative_occurrence_date,
                se.invasive_plant
              FROM invasivesbc.survey_extract se
              WHERE se.estimated_area_hectares = 0::numeric
              GROUP BY se.site_id, se.invasive_plant
            ), most_recent_both AS (
            SELECT a.site_id,
                a.invasive_plant,
                a.positive_occurrence_date,
                b.negative_occurrence_date
              FROM most_recent_positive_occurences a
                LEFT JOIN most_recent_negative_occurrences b ON a.site_id = b.site_id AND a.invasive_plant::text = b.invasive_plant::text
            ), site_species_status AS (
            SELECT most_recent_both.site_id,
                most_recent_both.invasive_plant,
                    CASE
                        WHEN most_recent_both.positive_occurrence_date > most_recent_both.negative_occurrence_date OR most_recent_both.positive_occurrence_date IS NOT NULL AND most_recent_both.negative_occurrence_date IS NULL THEN true
                        ELSE false
                    END AS is_species_positive,
                    CASE
                        WHEN most_recent_both.negative_occurrence_date > most_recent_both.positive_occurrence_date OR most_recent_both.negative_occurrence_date IS NOT NULL AND most_recent_both.positive_occurrence_date IS NULL THEN true
                        ELSE false
                    END AS is_species_negative
              FROM most_recent_both
            )
    SELECT site_species_status.site_id,
        site_species_status.invasive_plant,
        site_species_status.is_species_positive,
        site_species_status.is_species_negative
      FROM site_species_status
      ORDER BY site_species_status.is_species_negative DESC;

    -- Permissions

    ALTER TABLE invasivesbc.iapp_species_status OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.iapp_species_status TO invasivebc;


    -- invasivesbc.mechanical_treatment_monitoring_summary source

    CREATE OR REPLACE VIEW invasivesbc.mechanical_treatment_monitoring_summary
    AS WITH invasive_plants_on_site AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                convert_string_list_to_array_elements(activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,invasive_plants_on_site}'::text[]) AS invasive_plants_on_site_code
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), invasive_plants_on_site_select AS (
            SELECT i.activity_incoming_data_id,
                i.invasive_plants_on_site_code,
                monitoring_evidence_codes.code_description AS invasive_plants_on_site
              FROM invasive_plants_on_site i
                LEFT JOIN invasivesbc.code_header monitoring_evidence_code_header ON monitoring_evidence_code_header.code_header_title::text = 'monitoring_evidence_code'::text AND monitoring_evidence_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code monitoring_evidence_codes ON monitoring_evidence_codes.code_header_id = monitoring_evidence_code_header.code_header_id AND i.invasive_plants_on_site_code = monitoring_evidence_codes.code_name::text
            ), invasive_plants_on_site_agg AS (
            SELECT i.activity_incoming_data_id,
                string_agg(i.invasive_plants_on_site::text, ', '::text ORDER BY (i.invasive_plants_on_site::text)) AS invasive_plants_on_site
              FROM invasive_plants_on_site_select i
              GROUP BY i.activity_incoming_data_id
            ), mechanical_monitoring_json AS (
            SELECT a.activity_incoming_data_id,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,invasive_plant_code}'::text[] AS terrestrial_invasive_plant_code,
                invasive_plant_codes.code_description AS terrestrial_invasive_plant,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,invasive_plant_aquatic_code}'::text[] AS aquatic_invasive_plant_code,
                invasive_plant_aquatic_codes.code_description AS aquatic_invasive_plant,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,monitoring_details}'::text[] AS efficacy_comments,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,efficacy_code}'::text[] AS treatment_efficacy_rating_code,
                efficacy_codes.code_description AS treatment_efficacy_rating,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,management_efficacy_rating}'::text[] AS management_efficacy_rating_code,
                management_efficacy_codes.code_description AS management_efficacy_rating,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,evidence_of_treatment}'::text[] AS evidence_of_treatment,
                i.invasive_plants_on_site,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,treatment_pass}'::text[] AS treatment_pass,
                a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,comment}'::text[] AS comment
              FROM invasivesbc.activity_incoming_data a
                JOIN invasive_plants_on_site_agg i ON i.activity_incoming_data_id = a.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND (a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,invasive_plant_code}'::text[]) = invasive_plant_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON invasive_plant_aquatic_code_header.code_header_title::text = 'invasive_plant_aquatic_code'::text AND invasive_plant_aquatic_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id AND (a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,invasive_plant_aquatic_code}'::text[]) = invasive_plant_aquatic_codes.code_name::text
                LEFT JOIN invasivesbc.code_header efficacy_code_header ON efficacy_code_header.code_header_title::text = 'efficacy_code'::text AND efficacy_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code efficacy_codes ON efficacy_codes.code_header_id = efficacy_code_header.code_header_id AND (a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,efficacy_code}'::text[]) = efficacy_codes.code_name::text
                LEFT JOIN invasivesbc.code_header management_efficacy_code_header ON management_efficacy_code_header.code_header_title::text = 'management_efficacy_code'::text AND management_efficacy_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code management_efficacy_codes ON management_efficacy_codes.code_header_id = management_efficacy_code_header.code_header_id AND (a.activity_payload #>> '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information,management_efficacy_rating}'::text[]) = management_efficacy_codes.code_name::text
              WHERE (a.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        c.jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.observation_person,
        COALESCE(j.terrestrial_invasive_plant, j.aquatic_invasive_plant) AS invasive_plant,
        j.efficacy_comments,
        j.treatment_efficacy_rating,
        j.management_efficacy_rating,
        j.evidence_of_treatment,
        j.invasive_plants_on_site,
        j.treatment_pass,
        j.comment AS monitor_comment,
        c.elevation,
        c.well_proximity,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        LEFT JOIN mechanical_monitoring_json j ON j.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.mechanical_treatment_monitoring_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.mechanical_treatment_monitoring_summary TO invasivebc;


    -- invasivesbc.monitoring_summary source

    CREATE OR REPLACE VIEW invasivesbc.monitoring_summary
    AS SELECT activity_incoming_data.activity_id,
        activity_incoming_data.activity_subtype AS monitoring_type,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'acitivity_subtype_data'::text) -> 'efficacy_code'::text AS efficacy_code,
        activity_incoming_data.version,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'activity_date_time'::text AS activity_date_time,
        activity_incoming_data.created_timestamp AS submitted_time,
        activity_incoming_data.received_timestamp,
        activity_incoming_data.deleted_timestamp,
        activity_incoming_data.biogeoclimatic_zones,
        activity_incoming_data.regional_invasive_species_organization_areas,
        activity_incoming_data.invasive_plant_management_areas,
        activity_incoming_data.ownership,
        activity_incoming_data.regional_districts,
        activity_incoming_data.flnro_districts,
        activity_incoming_data.moti_districts,
        activity_incoming_data.elevation,
        activity_incoming_data.well_proximity,
        activity_incoming_data.utm_zone,
        activity_incoming_data.utm_northing,
        activity_incoming_data.utm_easting,
        activity_incoming_data.albers_northing,
        activity_incoming_data.albers_easting,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'latitude'::text AS latitude,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'longitude'::text AS longitude,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'reported_area'::text AS reported_area,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'invasive_species_agency_code'::text AS invasive_species_agency_code,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'general_comment'::text AS general_comment,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'access_description'::text AS access_description,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'jurisdictions'::text AS jurisdictions,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'project_code'::text AS project_code,
        activity_incoming_data.geom,
        activity_incoming_data.geog,
        activity_incoming_data.media_keys,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_type_data'::text) -> 'observer_last_name'::text AS primary_user_last_name,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_type_data'::text) -> 'observer_first_name'::text AS primary_user_first_name,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'acitivity_subtype_data'::text) -> 'invasive_plant_code'::text AS invasive_plant_code,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'general_comment'::text AS general_observation_comment__needs_verify
      FROM invasivesbc.activity_incoming_data
      WHERE activity_incoming_data.activity_type::text = 'Monitoring'::text AND activity_incoming_data.deleted_timestamp IS NULL;

    -- Permissions

    ALTER TABLE invasivesbc.monitoring_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.monitoring_summary TO invasivebc;


    -- invasivesbc.observation_aquatic_plant_summary source

    CREATE OR REPLACE VIEW invasivesbc.observation_aquatic_plant_summary
    AS WITH waterbody_outflow AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                convert_string_list_to_array_elements(activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,WaterbodyData,outflow}'::text[]) AS outflow_code
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), waterbody_outflow_code AS (
            SELECT w.activity_incoming_data_id,
                w.outflow_code,
                outflow_codes.code_description AS outflow
              FROM waterbody_outflow w
                LEFT JOIN invasivesbc.code_header outflow_code_header ON outflow_code_header.code_header_title::text = 'outflow_code'::text AND outflow_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code outflow_codes ON outflow_codes.code_header_id = outflow_code_header.code_header_id AND w.outflow_code = outflow_codes.code_name::text
            ), waterbody_outflow_agg AS (
            SELECT w.activity_incoming_data_id,
                string_agg(w.outflow::text, ', '::text ORDER BY (w.outflow::text)) AS outflow
              FROM waterbody_outflow_code w
              GROUP BY w.activity_incoming_data_id
            ), waterbody_outflow_other AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                convert_string_list_to_array_elements(activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,WaterbodyData,outflow_other}'::text[]) AS outflow_other_code,
                outflow_codes.code_description AS outflow_other
              FROM invasivesbc.activity_incoming_data
                LEFT JOIN invasivesbc.code_header outflow_code_header ON outflow_code_header.code_header_title::text = 'outflow_code'::text AND outflow_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code outflow_codes ON outflow_codes.code_header_id = outflow_code_header.code_header_id AND (activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,WaterbodyData,outflow_other}'::text[]) = outflow_codes.code_name::text
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), waterbody_outflow_other_code AS (
            SELECT w.activity_incoming_data_id,
                w.outflow_other_code,
                outflow_codes.code_description AS outflow_other
              FROM waterbody_outflow_other w
                LEFT JOIN invasivesbc.code_header outflow_code_header ON outflow_code_header.code_header_title::text = 'outflow_code'::text AND outflow_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code outflow_codes ON outflow_codes.code_header_id = outflow_code_header.code_header_id AND w.outflow_other_code = outflow_codes.code_name::text
            ), waterbody_outflow_other_agg AS (
            SELECT w.activity_incoming_data_id,
                string_agg(w.outflow_other::text, ', '::text ORDER BY (w.outflow_other::text)) AS outflow_other
              FROM waterbody_outflow_other_code w
              GROUP BY w.activity_incoming_data_id
            ), waterbody_inflow AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                convert_string_list_to_array_elements(activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,WaterbodyData,inflow_permanent}'::text[]) AS inflow_code
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), waterbody_inflow_code AS (
            SELECT w.activity_incoming_data_id,
                w.inflow_code,
                inflow_permanent_codes.code_description AS inflow
              FROM waterbody_inflow w
                LEFT JOIN invasivesbc.code_header inflow_permanent_code_header ON inflow_permanent_code_header.code_header_title::text = 'inflow_permanent_code'::text AND inflow_permanent_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code inflow_permanent_codes ON inflow_permanent_codes.code_header_id = inflow_permanent_code_header.code_header_id AND w.inflow_code = inflow_permanent_codes.code_name::text
            ), waterbody_inflow_agg AS (
            SELECT w.activity_incoming_data_id,
                string_agg(w.inflow::text, ', '::text ORDER BY (w.inflow::text)) AS inflow
              FROM waterbody_inflow_code w
              GROUP BY w.activity_incoming_data_id
            ), waterbody_inflow_other AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                convert_string_list_to_array_elements(activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,WaterbodyData,inflow_other}'::text[]) AS inflow_other_code,
                inflow_temporary_codes.code_description AS inflow_other
              FROM invasivesbc.activity_incoming_data
                LEFT JOIN invasivesbc.code_header inflow_temporary_code_header ON inflow_temporary_code_header.code_header_title::text = 'inflow_temporary_code'::text AND inflow_temporary_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code inflow_temporary_codes ON inflow_temporary_codes.code_header_id = inflow_temporary_code_header.code_header_id AND (activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,WaterbodyData,inflow_other}'::text[]) = inflow_temporary_codes.code_name::text
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), waterbody_inflow_other_code AS (
            SELECT w.activity_incoming_data_id,
                w.inflow_other_code,
                inflow_temporary_codes.code_description AS inflow_other
              FROM waterbody_inflow_other w
                LEFT JOIN invasivesbc.code_header inflow_temporary_code_header ON inflow_temporary_code_header.code_header_title::text = 'inflow_temporary_code'::text AND inflow_temporary_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code inflow_temporary_codes ON inflow_temporary_codes.code_header_id = inflow_temporary_code_header.code_header_id AND w.inflow_other_code = inflow_temporary_codes.code_name::text
            ), waterbody_inflow_other_agg AS (
            SELECT w.activity_incoming_data_id,
                string_agg(w.inflow_other::text, ', '::text ORDER BY (w.inflow_other::text)) AS inflow_other
              FROM waterbody_inflow_other_code w
              GROUP BY w.activity_incoming_data_id
            ), waterbody_use AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                convert_string_list_to_array_elements(activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,WaterbodyData,waterbody_use}'::text[]) AS waterbody_use_code
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), waterbody_use_code AS (
            SELECT w.activity_incoming_data_id,
                w.waterbody_use_code,
                waterbody_use_codes.code_description AS waterbody_use
              FROM waterbody_use w
                LEFT JOIN invasivesbc.code_header waterbody_use_code_header ON waterbody_use_code_header.code_header_title::text = 'waterbody_use_code'::text AND waterbody_use_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code waterbody_use_codes ON waterbody_use_codes.code_header_id = waterbody_use_code_header.code_header_id AND w.waterbody_use_code = waterbody_use_codes.code_name::text
            ), waterbody_use_agg AS (
            SELECT w.activity_incoming_data_id,
                string_agg(w.waterbody_use::text, ', '::text ORDER BY (w.waterbody_use::text)) AS waterbody_use
              FROM waterbody_use_code w
              GROUP BY w.activity_incoming_data_id
            ), adjacent_land_use AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                convert_string_list_to_array_elements(activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,WaterbodyData,adjacent_land_use}'::text[]) AS adjacent_land_use_code
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), adjacent_land_use_code AS (
            SELECT w.activity_incoming_data_id,
                w.adjacent_land_use_code,
                adjacent_land_use_codes.code_description AS adjacent_land_use
              FROM adjacent_land_use w
                LEFT JOIN invasivesbc.code_header adjacent_land_use_code_header ON adjacent_land_use_code_header.code_header_title::text = 'adjacent_land_use_code'::text AND adjacent_land_use_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code adjacent_land_use_codes ON adjacent_land_use_codes.code_header_id = adjacent_land_use_code_header.code_header_id AND w.adjacent_land_use_code = adjacent_land_use_codes.code_name::text
            ), adjacent_land_use_agg AS (
            SELECT w.activity_incoming_data_id,
                string_agg(w.adjacent_land_use::text, ', '::text ORDER BY (w.adjacent_land_use::text)) AS adjacent_land_use
              FROM adjacent_land_use_code w
              GROUP BY w.activity_incoming_data_id
            ), shoreline_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.form_status,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,ShorelineTypes}'::text[]) AS shorelines
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), shoreline_array_select AS (
            SELECT a_1.activity_incoming_data_id,
                a_1.shorelines #>> '{shoreline_type}'::text[] AS shoreline_type,
                shoreline_type_codes.code_description AS shoreline_description,
                a_1.shorelines #>> '{percent_covered}'::text[] AS percent_covered
              FROM shoreline_array a_1
                LEFT JOIN invasivesbc.code_header shoreline_type_code_header ON shoreline_type_code_header.code_header_title::text = 'shoreline_type_code'::text AND shoreline_type_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code shoreline_type_codes ON shoreline_type_codes.code_header_id = shoreline_type_code_header.code_header_id AND (a_1.shorelines #>> '{shoreline_type}'::text[]) = shoreline_type_codes.code_name::text
            ), shoreline_agg AS (
            SELECT string_agg(((a_1.shoreline_description::text || ' '::text) || a_1.percent_covered) || '%'::text, ', '::text ORDER BY a_1.shoreline_description) AS shorelines,
                a_1.activity_incoming_data_id
              FROM shoreline_array_select a_1
              GROUP BY a_1.activity_incoming_data_id
            ), aquatic_plant_json AS (
            SELECT a_1.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.activity_incoming_data_id AS id,
                a_1.shorelines,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,AquaticPlants}'::text[]) AS json_array,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data}'::text[] AS json_data
              FROM shoreline_agg a_1
                JOIN invasivesbc.activity_incoming_data ON activity_incoming_data.activity_incoming_data_id = a_1.activity_incoming_data_id
            ), aquatic_plant_json_select AS (
            SELECT a_1.shorelines,
                a_1.activity_incoming_data_id,
                a_1.json_data #>> '{WaterbodyData,waterbody_type}'::text[] AS waterbody_type,
                a_1.json_data #>> '{WaterbodyData,waterbody_name_gazetted}'::text[] AS waterbody_name_gazetted,
                a_1.json_data #>> '{WaterbodyData,waterbody_name_local}'::text[] AS waterbody_name_local,
                a_1.json_data #>> '{WaterbodyData,waterbody_access}'::text[] AS waterbody_access,
                waterbody_use_agg.waterbody_use,
                a_1.json_data #>> '{WaterbodyData,water_level_management}'::text[] AS water_level_management,
                a_1.json_data #>> '{WaterbodyData,substrate_type}'::text[] AS substrate_type,
                a_1.json_data #>> '{WaterbodyData,tidal_influence}'::text[] AS tidal_influence,
                adjacent_land_use_agg.adjacent_land_use,
                waterbody_inflow_agg.inflow AS inflow_permanent,
                waterbody_inflow_other_agg.inflow_other,
                waterbody_outflow_agg.outflow,
                waterbody_outflow_other_agg.outflow_other,
                a_1.json_data #>> '{WaterbodyData,comment}'::text[] AS waterbody_comment,
                a_1.json_data #>> '{WaterQuality,water_sample_depth}'::text[] AS water_sample_depth,
                a_1.json_data #>> '{WaterQuality,secchi_depth}'::text[] AS secchi_depth,
                a_1.json_data #>> '{WaterQuality,water_colour}'::text[] AS water_colour,
                a_1.json_data #>> '{Observation_PlantAquatic_Information,suitable_for_biocontrol_agent}'::text[] AS suitable_for_biocontrol_agent,
                a_1.json_array #>> '{sample_point_id}'::text[] AS sample_point_id,
                a_1.json_array #>> '{observation_type}'::text[] AS observation_type,
                a_1.json_array #>> '{invasive_plant_code}'::text[] AS invasive_plant_code,
                invasive_plant_aquatic_codes.code_description AS invasive_plant,
                a_1.json_array #>> '{plant_life_stage_code}'::text[] AS plant_life_stage_code,
                plant_life_stage_codes.code_description AS plant_life_stage,
                a_1.json_array #>> '{invasive_plant_density_code}'::text[] AS invasive_plant_density_code,
                invasive_plant_density_codes.code_description AS invasive_plant_density,
                a_1.json_array #>> '{invasive_plant_distribution_code}'::text[] AS invasive_plant_distribution_code,
                invasive_plant_distribution_codes.code_description AS invasive_plant_distribution,
                a_1.json_array #>> '{voucher_specimen_collected}'::text[] AS voucher_specimen_collected,
                a_1.json_array #>> '{voucher_specimen_collection_information,accession_number}'::text[] AS accession_number,
                a_1.json_array #>> '{voucher_specimen_collection_information,exact_utm_coords,utm_zone}'::text[] AS voucher_utm_zone,
                a_1.json_array #>> '{voucher_specimen_collection_information,exact_utm_coords,utm_easting}'::text[] AS voucher_utm_easting,
                a_1.json_array #>> '{voucher_specimen_collection_information,exact_utm_coords,utm_northing}'::text[] AS voucher_utm_northing,
                a_1.json_array #>> '{voucher_specimen_collection_information,name_of_herbarium}'::text[] AS name_of_herbarium,
                a_1.json_array #>> '{voucher_specimen_collection_information,voucher_sample_id}'::text[] AS voucher_sample_id,
                a_1.json_array #>> '{voucher_specimen_collection_information,date_voucher_verified}'::text[] AS date_voucher_verified,
                a_1.json_array #>> '{voucher_specimen_collection_information,date_voucher_collected}'::text[] AS date_voucher_collected,
                a_1.json_array #>> '{voucher_specimen_collection_information,voucher_verification_completed_by,person_name}'::text[] AS voucher_person_name,
                a_1.json_array #>> '{voucher_specimen_collection_information,voucher_verification_completed_by,organization}'::text[] AS voucher_organization
              FROM aquatic_plant_json a_1
                LEFT JOIN adjacent_land_use_agg ON adjacent_land_use_agg.activity_incoming_data_id = a_1.activity_incoming_data_id
                LEFT JOIN waterbody_use_agg ON waterbody_use_agg.activity_incoming_data_id = a_1.activity_incoming_data_id
                LEFT JOIN waterbody_inflow_agg ON waterbody_inflow_agg.activity_incoming_data_id = a_1.activity_incoming_data_id
                LEFT JOIN waterbody_inflow_other_agg ON waterbody_inflow_other_agg.activity_incoming_data_id = a_1.activity_incoming_data_id
                LEFT JOIN waterbody_outflow_agg ON waterbody_outflow_agg.activity_incoming_data_id = a_1.activity_incoming_data_id
                LEFT JOIN waterbody_outflow_other_agg ON waterbody_outflow_other_agg.activity_incoming_data_id = a_1.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON invasive_plant_aquatic_code_header.code_header_title::text = 'invasive_plant_aquatic_code'::text AND invasive_plant_aquatic_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id AND (a_1.json_array #>> '{invasive_plant_code}'::text[]) = invasive_plant_aquatic_codes.code_name::text
                LEFT JOIN invasivesbc.code_header plant_life_stage_code_header ON plant_life_stage_code_header.code_header_title::text = 'plant_life_stage_code'::text AND plant_life_stage_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code plant_life_stage_codes ON plant_life_stage_codes.code_header_id = plant_life_stage_code_header.code_header_id AND (a_1.json_array #>> '{plant_life_stage_code}'::text[]) = plant_life_stage_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_density_code_header ON invasive_plant_density_code_header.code_header_title::text = 'invasive_plant_density_code'::text AND invasive_plant_density_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_density_codes ON invasive_plant_density_codes.code_header_id = invasive_plant_density_code_header.code_header_id AND (a_1.json_array #>> '{invasive_plant_density_code}'::text[]) = invasive_plant_density_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_distribution_code_header ON invasive_plant_distribution_code_header.code_header_title::text = 'invasive_plant_distribution_code'::text AND invasive_plant_distribution_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_distribution_codes ON invasive_plant_distribution_codes.code_header_id = invasive_plant_distribution_code_header.code_header_id AND (a_1.json_array #>> '{invasive_plant_distribution_code}'::text[]) = invasive_plant_distribution_codes.code_name::text
              WHERE a_1.activity_subtype::text = 'Activity_Observation_PlantAquatic'::text AND (a_1.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        c.jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.pre_treatment_observation,
        c.observation_person,
        a.shorelines,
        a.waterbody_type,
        a.waterbody_name_gazetted,
        a.waterbody_name_local,
        a.waterbody_access,
        a.waterbody_use,
        a.water_level_management,
        a.substrate_type,
        a.tidal_influence,
        a.adjacent_land_use,
        a.inflow_permanent,
        a.inflow_other,
        a.outflow,
        a.outflow_other,
        a.waterbody_comment,
        a.water_sample_depth,
        a.secchi_depth,
        a.water_colour,
        a.suitable_for_biocontrol_agent,
        a.sample_point_id,
        a.observation_type,
        a.invasive_plant,
        a.plant_life_stage,
        a.invasive_plant_density,
        a.invasive_plant_distribution,
        a.accession_number,
        a.voucher_utm_zone,
        a.voucher_utm_easting,
        a.voucher_utm_northing,
        a.name_of_herbarium,
        a.voucher_sample_id,
        a.date_voucher_verified,
        a.date_voucher_collected,
        a.voucher_person_name,
        a.voucher_organization,
        c.elevation,
        c.well_proximity,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        LEFT JOIN aquatic_plant_json_select a ON a.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Observation_PlantAquatic'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.observation_aquatic_plant_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.observation_aquatic_plant_summary TO invasivebc;

    -- invasivesbc.observation_summary source

    CREATE OR REPLACE VIEW invasivesbc.observation_summary
    AS SELECT activity_incoming_data.activity_id,
        activity_incoming_data.activity_subtype AS observation_type,
        activity_incoming_data.version,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'activity_date_time'::text AS activity_date_time,
        activity_incoming_data.created_timestamp AS submitted_time,
        activity_incoming_data.received_timestamp,
        activity_incoming_data.deleted_timestamp,
        activity_incoming_data.biogeoclimatic_zones,
        activity_incoming_data.regional_invasive_species_organization_areas,
        activity_incoming_data.invasive_plant_management_areas,
        activity_incoming_data.ownership,
        activity_incoming_data.regional_districts,
        activity_incoming_data.flnro_districts,
        activity_incoming_data.moti_districts,
        activity_incoming_data.elevation,
        activity_incoming_data.well_proximity,
        activity_incoming_data.utm_zone,
        activity_incoming_data.utm_northing,
        activity_incoming_data.utm_easting,
        activity_incoming_data.albers_northing,
        activity_incoming_data.albers_easting,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'latitude'::text AS latitude,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'longitude'::text AS longitude,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'reported_area'::text AS reported_area,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'invasive_species_agency_code'::text AS invasive_species_agency_code,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'general_comment'::text AS general_comment,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'access_description'::text AS access_description,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'jurisdictions'::text AS jurisdictions,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'project_code'::text AS project_code,
        activity_incoming_data.geom,
        activity_incoming_data.geog,
        activity_incoming_data.media_keys,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_type_data'::text) -> 'negative_obs_ind'::text AS negative_observation_ind,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_type_data'::text) -> 'observer_last_name'::text AS primary_user_last_name,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_type_data'::text) -> 'observer_first_name'::text AS primary_user_first_name,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'acitivity_subtype_data'::text) -> 'invasive_plant_code'::text AS invasive_plant_code,
        activity_incoming_data.activity_payload::json -> 'location_comment'::text AS location_comment__needs_verify,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'general_comment'::text AS general_observation_comment__needs_verify
      FROM invasivesbc.activity_incoming_data
      WHERE activity_incoming_data.activity_type::text = 'Observation'::text AND activity_incoming_data.deleted_timestamp IS NULL;

    -- Permissions

    ALTER TABLE invasivesbc.observation_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.observation_summary TO invasivebc;

    -- invasivesbc.observation_aquaticplant_summary source

    CREATE OR REPLACE VIEW invasivesbc.observation_aquaticplant_summary
    AS SELECT record.activity_id,
        aid.version,
        aid.biogeoclimatic_zones,
        aid.regional_invasive_species_organization_areas,
        aid.invasive_plant_management_areas,
        aid.ownership,
        aid.regional_districts,
        aid.flnro_districts,
        aid.moti_districts,
        aid.elevation,
        aid.well_proximity,
        aid.utm_zone,
        aid.utm_northing,
        aid.utm_easting,
        aid.albers_northing,
        aid.albers_easting,
        aid.latitude,
        aid.longitude,
        aid.reported_area,
        aid.invasive_species_agency_code,
        aid.general_comment,
        aid.access_description,
        aid.jurisdictions,
        aid.project_code,
        aid.geom,
        aid.geog,
        aid.media_keys,
        invasive_plant_codes.code_description AS invasive_plant,
        record.invasive_plant_code,
        specific_use_codes.code_description AS specific_use,
        record.specific_use_code,
        proposed_treatment_codes.code_description AS proposed_treatment,
        record.proposed_treatment_code,
        record.flowering,
        plant_life_stage_codes.code_description AS plant_life_stage,
        record.plant_life_stage_code,
        plant_health_codes.code_description AS plant_health,
        record.plant_health_code,
        plant_seed_stage_codes.code_description AS plant_seed_stage,
        record.plant_seed_stage_code,
        record.range_unit_number,
        record.legacy_site_ind,
        record.early_detection_rapid_resp_ind,
        record.research_detection_ind,
        record.sample_point_number,
        record.special_care_ind,
        record.biological_ind,
        record.secchi_depth,
        record.water_depth,
        record.voucher_submitted_ind,
        record.voucher_submission_detail
      FROM invasivesbc.activity_observation_aquaticplant_with_codes record
        JOIN invasivesbc.observation_summary aid ON aid.activity_id = record.activity_id
        LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND record.invasive_plant_code = invasive_plant_codes.code_name::text
        LEFT JOIN invasivesbc.code_header proposed_treatment_code_header ON proposed_treatment_code_header.code_header_title::text = 'proposed_treatment_code'::text AND proposed_treatment_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code proposed_treatment_codes ON proposed_treatment_codes.code_header_id = proposed_treatment_code_header.code_header_id AND record.proposed_treatment_code = proposed_treatment_codes.code_name::text
        LEFT JOIN invasivesbc.code_header specific_use_code_header ON specific_use_code_header.code_header_title::text = 'specific_use_code'::text AND specific_use_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code specific_use_codes ON specific_use_codes.code_header_id = specific_use_code_header.code_header_id AND record.specific_use_code = specific_use_codes.code_name::text
        LEFT JOIN invasivesbc.code_header plant_life_stage_code_header ON plant_life_stage_code_header.code_header_title::text = 'plant_life_stage_code'::text AND plant_life_stage_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code plant_life_stage_codes ON plant_life_stage_codes.code_header_id = plant_life_stage_code_header.code_header_id AND record.plant_life_stage_code = plant_life_stage_codes.code_name::text
        LEFT JOIN invasivesbc.code_header plant_health_code_header ON plant_health_code_header.code_header_title::text = 'plant_health_code'::text AND plant_health_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code plant_health_codes ON plant_health_codes.code_header_id = plant_health_code_header.code_header_id AND record.plant_health_code = plant_health_codes.code_name::text
        LEFT JOIN invasivesbc.code_header plant_seed_stage_code_header ON plant_seed_stage_code_header.code_header_title::text = 'plant_seed_stage_code'::text AND plant_seed_stage_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code plant_seed_stage_codes ON plant_seed_stage_codes.code_header_id = plant_seed_stage_code_header.code_header_id AND record.plant_seed_stage_code = plant_seed_stage_codes.code_name::text;

    -- Permissions

    ALTER TABLE invasivesbc.observation_aquaticplant_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.observation_aquaticplant_summary TO invasivebc;


    -- invasivesbc.observation_summary source

    CREATE OR REPLACE VIEW invasivesbc.observation_summary
    AS SELECT activity_incoming_data.activity_id,
        activity_incoming_data.activity_subtype AS observation_type,
        activity_incoming_data.version,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'activity_date_time'::text AS activity_date_time,
        activity_incoming_data.created_timestamp AS submitted_time,
        activity_incoming_data.received_timestamp,
        activity_incoming_data.deleted_timestamp,
        activity_incoming_data.biogeoclimatic_zones,
        activity_incoming_data.regional_invasive_species_organization_areas,
        activity_incoming_data.invasive_plant_management_areas,
        activity_incoming_data.ownership,
        activity_incoming_data.regional_districts,
        activity_incoming_data.flnro_districts,
        activity_incoming_data.moti_districts,
        activity_incoming_data.elevation,
        activity_incoming_data.well_proximity,
        activity_incoming_data.utm_zone,
        activity_incoming_data.utm_northing,
        activity_incoming_data.utm_easting,
        activity_incoming_data.albers_northing,
        activity_incoming_data.albers_easting,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'latitude'::text AS latitude,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'longitude'::text AS longitude,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'reported_area'::text AS reported_area,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'invasive_species_agency_code'::text AS invasive_species_agency_code,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'general_comment'::text AS general_comment,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'access_description'::text AS access_description,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'jurisdictions'::text AS jurisdictions,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'project_code'::text AS project_code,
        activity_incoming_data.geom,
        activity_incoming_data.geog,
        activity_incoming_data.media_keys,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_type_data'::text) -> 'negative_obs_ind'::text AS negative_observation_ind,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_type_data'::text) -> 'observer_last_name'::text AS primary_user_last_name,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_type_data'::text) -> 'observer_first_name'::text AS primary_user_first_name,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'acitivity_subtype_data'::text) -> 'invasive_plant_code'::text AS invasive_plant_code,
        activity_incoming_data.activity_payload::json -> 'location_comment'::text AS location_comment__needs_verify,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'general_comment'::text AS general_observation_comment__needs_verify
      FROM invasivesbc.activity_incoming_data
      WHERE activity_incoming_data.activity_type::text = 'Observation'::text AND activity_incoming_data.deleted_timestamp IS NULL;

    -- Permissions

    ALTER TABLE invasivesbc.observation_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.observation_summary TO invasivebc;


    -- invasivesbc.observation_terrestrial_plant_summary source

    CREATE OR REPLACE VIEW invasivesbc.observation_terrestrial_plant_summary
    AS WITH terrestrial_plant_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,TerrestrialPlants}'::text[]) AS json_array,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information}'::text[] AS json_data
              FROM invasivesbc.activity_incoming_data
            ), terrestrial_plant_select AS (
            SELECT t_1.activity_incoming_data_id,
                t_1.json_data #>> '{soil_texture_code}'::text[] AS soil_texture_code,
                soil_texture_codes.code_description AS soil_texture,
                t_1.json_data #>> '{specific_use_code}'::text[] AS specific_use_code,
                specific_use_codes.code_description AS specific_use,
                t_1.json_data #>> '{slope_code}'::text[] AS slope_code,
                slope_codes.code_description AS slope,
                t_1.json_data #>> '{aspect_code}'::text[] AS aspect_code,
                aspect_codes.code_description AS aspect,
                t_1.json_data #>> '{research_detection_ind}'::text[] AS research_observation,
                t_1.json_data #>> '{well_ind}'::text[] AS visible_well_nearby,
                t_1.json_data #>> '{suitable_for_biocontrol_agent}'::text[] AS suitable_for_biocontrol_agent,
                t_1.json_array #>> '{occurrence}'::text[] AS occurrence,
                t_1.json_array #>> '{edna_sample}'::text[] AS edna_sample,
                t_1.json_array #>> '{invasive_plant_code}'::text[] AS invasive_plant_code,
                invasive_plant_codes.code_description AS invasive_plant,
                t_1.json_array #>> '{plant_life_stage_code}'::text[] AS plant_life_stage_code,
                plant_life_stage_codes.code_description AS plant_life_stage,
                t_1.json_array #>> '{voucher_specimen_collected}'::text[] AS voucher_specimen_collected,
                t_1.json_array #>> '{invasive_plant_density_code}'::text[] AS invasive_plant_density_code,
                invasive_plant_density_codes.code_description AS invasive_plant_density,
                t_1.json_array #>> '{invasive_plant_distribution_code}'::text[] AS invasive_plant_distribution_code,
                invasive_plant_distribution_codes.code_description AS invasive_plant_distribution,
                t_1.json_array #>> '{voucher_specimen_collection_information,accession_number}'::text[] AS accession_number,
                t_1.json_array #>> '{voucher_specimen_collection_information,exact_utm_coords,utm_zone}'::text[] AS voucher_utm_zone,
                t_1.json_array #>> '{voucher_specimen_collection_information,exact_utm_coords,utm_easting}'::text[] AS voucher_utm_easting,
                t_1.json_array #>> '{voucher_specimen_collection_information,exact_utm_coords,utm_northing}'::text[] AS voucher_utm_northing,
                t_1.json_array #>> '{voucher_specimen_collection_information,name_of_herbarium}'::text[] AS name_of_herbarium,
                t_1.json_array #>> '{voucher_specimen_collection_information,voucher_sample_id}'::text[] AS voucher_sample_id,
                t_1.json_array #>> '{voucher_specimen_collection_information,date_voucher_verified}'::text[] AS date_voucher_verified,
                t_1.json_array #>> '{voucher_specimen_collection_information,date_voucher_collected}'::text[] AS date_voucher_collected,
                t_1.json_array #>> '{voucher_specimen_collection_information,voucher_verification_completed_by,person_name}'::text[] AS voucher_person_name,
                t_1.json_array #>> '{voucher_specimen_collection_information,voucher_verification_completed_by,organization}'::text[] AS voucher_organization
              FROM terrestrial_plant_array t_1
                LEFT JOIN invasivesbc.code_header soil_texture_code_header ON soil_texture_code_header.code_header_title::text = 'soil_texture_code'::text AND soil_texture_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code soil_texture_codes ON soil_texture_codes.code_header_id = soil_texture_code_header.code_header_id AND (t_1.json_data #>> '{soil_texture_code}'::text[]) = soil_texture_codes.code_name::text
                LEFT JOIN invasivesbc.code_header specific_use_code_header ON specific_use_code_header.code_header_title::text = 'specific_use_code'::text AND specific_use_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code specific_use_codes ON specific_use_codes.code_header_id = specific_use_code_header.code_header_id AND (t_1.json_data #>> '{specific_use_code}'::text[]) = specific_use_codes.code_name::text
                LEFT JOIN invasivesbc.code_header slope_code_header ON slope_code_header.code_header_title::text = 'slope_code'::text AND slope_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code slope_codes ON slope_codes.code_header_id = slope_code_header.code_header_id AND (t_1.json_data #>> '{slope_code}'::text[]) = slope_codes.code_name::text
                LEFT JOIN invasivesbc.code_header aspect_code_header ON aspect_code_header.code_header_title::text = 'aspect_code'::text AND aspect_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code aspect_codes ON aspect_codes.code_header_id = aspect_code_header.code_header_id AND (t_1.json_data #>> '{aspect_code}'::text[]) = aspect_codes.code_name::text
                LEFT JOIN invasivesbc.code_header plant_life_stage_code_header ON plant_life_stage_code_header.code_header_title::text = 'plant_life_stage_code'::text AND plant_life_stage_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code plant_life_stage_codes ON plant_life_stage_codes.code_header_id = plant_life_stage_code_header.code_header_id AND (t_1.json_array #>> '{plant_life_stage_code}'::text[]) = plant_life_stage_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_density_code_header ON invasive_plant_density_code_header.code_header_title::text = 'invasive_plant_density_code'::text AND invasive_plant_density_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_density_codes ON invasive_plant_density_codes.code_header_id = invasive_plant_density_code_header.code_header_id AND (t_1.json_array #>> '{invasive_plant_density_code}'::text[]) = invasive_plant_density_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_distribution_code_header ON invasive_plant_distribution_code_header.code_header_title::text = 'invasive_plant_distribution_code'::text AND invasive_plant_distribution_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_distribution_codes ON invasive_plant_distribution_codes.code_header_id = invasive_plant_distribution_code_header.code_header_id AND (t_1.json_array #>> '{invasive_plant_distribution_code}'::text[]) = invasive_plant_distribution_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND (t_1.json_array #>> '{invasive_plant_code}'::text[]) = invasive_plant_codes.code_name::text
              WHERE t_1.activity_subtype::text = 'Activity_Observation_PlantTerrestrial'::text AND (t_1.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        c.jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.pre_treatment_observation,
        c.observation_person,
        t.soil_texture,
        t.specific_use,
        t.slope,
        t.aspect,
        t.research_observation,
        t.visible_well_nearby,
        t.suitable_for_biocontrol_agent,
        t.invasive_plant,
        t.occurrence,
        t.invasive_plant_density AS density,
        t.invasive_plant_distribution AS distribution,
        t.plant_life_stage AS life_stage,
        t.voucher_sample_id,
        t.date_voucher_collected,
        t.date_voucher_verified,
        t.name_of_herbarium,
        t.accession_number,
        t.voucher_person_name,
        t.voucher_organization,
        t.voucher_utm_zone,
        t.voucher_utm_easting,
        t.voucher_utm_northing,
        c.elevation,
        c.well_proximity,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        JOIN terrestrial_plant_select t ON t.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Observation_PlantTerrestrial'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.observation_terrestrial_plant_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.observation_terrestrial_plant_summary TO invasivebc;


    -- invasivesbc.observation_terrestrialplant source

    CREATE OR REPLACE VIEW invasivesbc.observation_terrestrialplant
    AS SELECT record.activity_id,
        summary.version,
        summary.activity_date_time,
        summary.submitted_time,
        summary.received_timestamp,
        summary.deleted_timestamp,
        summary.biogeoclimatic_zones,
        summary.regional_invasive_species_organization_areas,
        summary.invasive_plant_management_areas,
        summary.ownership,
        summary.regional_districts,
        summary.flnro_districts,
        summary.moti_districts,
        summary.elevation,
        summary.well_proximity,
        summary.utm_zone,
        summary.utm_northing,
        summary.utm_easting,
        summary.albers_northing,
        summary.albers_easting,
        summary.latitude,
        summary.longitude,
        summary.reported_area,
        summary.invasive_species_agency_code,
        summary.general_comment,
        summary.access_description,
        summary.jurisdictions,
        summary.project_code,
        summary.geom,
        summary.geog,
        summary.media_keys,
        invasive_plant_codes.code_description AS invasive_plant,
        record.invasive_plant_code,
        invasive_plant_density_codes.code_description AS invasive_plant_density,
        record.invasive_plant_density_code,
        invasive_plant_distribution_codes.code_description AS invasive_plant_distribution,
        record.invasive_plant_distribution_code,
        soil_texture_codes.code_description AS soil_texture,
        record.soil_texture_code,
        specific_use_codes.code_description AS specific_use,
        record.specific_use_code,
        slope_codes.code_description AS slope,
        record.slope_code,
        aspect_codes.code_description AS aspect,
        record.aspect_code,
        proposed_treatment_codes.code_description AS proposed_treatment,
        record.proposed_treatment_code,
        record.range_unit_number,
        plant_life_stage_codes.code_description AS plant_life_stage,
        record.plant_life_stage_code,
        plant_health_codes.code_description AS plant_health,
        record.plant_health_code,
        plant_seed_stage_codes.code_description AS plant_seed_stage,
        record.plant_seed_stage_code,
        record.flowering,
        record.legacy_site_ind,
        record.early_detection_rapid_resp_ind,
        record.research_detection_ind,
        record.well_ind,
        record.special_care_ind,
        record.biological_ind
      FROM invasivesbc.activity_observation_terrestrialplant_with_codes record
        JOIN invasivesbc.observation_summary summary ON summary.activity_id = record.activity_id
        LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND record.invasive_plant_code = invasive_plant_codes.code_name::text
        LEFT JOIN invasivesbc.code_header invasive_plant_density_code_header ON invasive_plant_density_code_header.code_header_title::text = 'invasive_plant_density_code'::text AND invasive_plant_density_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code invasive_plant_density_codes ON invasive_plant_density_codes.code_header_id = invasive_plant_density_code_header.code_header_id AND record.invasive_plant_density_code = invasive_plant_density_codes.code_name::text
        LEFT JOIN invasivesbc.code_header invasive_plant_distribution_code_header ON invasive_plant_distribution_code_header.code_header_title::text = 'invasive_plant_distribution_code'::text AND invasive_plant_distribution_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code invasive_plant_distribution_codes ON invasive_plant_distribution_codes.code_header_id = invasive_plant_distribution_code_header.code_header_id AND record.invasive_plant_distribution_code = invasive_plant_distribution_codes.code_name::text
        LEFT JOIN invasivesbc.code_header soil_texture_code_header ON soil_texture_code_header.code_header_title::text = 'soil_texture_code'::text AND soil_texture_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code soil_texture_codes ON soil_texture_codes.code_header_id = soil_texture_code_header.code_header_id AND record.soil_texture_code = soil_texture_codes.code_name::text
        LEFT JOIN invasivesbc.code_header specific_use_code_header ON specific_use_code_header.code_header_title::text = 'specific_use_code'::text AND specific_use_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code specific_use_codes ON specific_use_codes.code_header_id = specific_use_code_header.code_header_id AND record.specific_use_code = specific_use_codes.code_name::text
        LEFT JOIN invasivesbc.code_header slope_code_header ON slope_code_header.code_header_title::text = 'slope_code'::text AND slope_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code slope_codes ON slope_codes.code_header_id = slope_code_header.code_header_id AND record.slope_code = slope_codes.code_name::text
        LEFT JOIN invasivesbc.code_header aspect_code_header ON aspect_code_header.code_header_title::text = 'aspect_code'::text AND aspect_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code aspect_codes ON aspect_codes.code_header_id = aspect_code_header.code_header_id AND record.aspect_code = aspect_codes.code_name::text
        LEFT JOIN invasivesbc.code_header proposed_treatment_code_header ON proposed_treatment_code_header.code_header_title::text = 'proposed_treatment_code'::text AND proposed_treatment_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code proposed_treatment_codes ON proposed_treatment_codes.code_header_id = proposed_treatment_code_header.code_header_id AND record.proposed_treatment_code = proposed_treatment_codes.code_name::text
        LEFT JOIN invasivesbc.code_header plant_life_stage_code_header ON plant_life_stage_code_header.code_header_title::text = 'plant_life_stage_code'::text AND plant_life_stage_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code plant_life_stage_codes ON plant_life_stage_codes.code_header_id = plant_life_stage_code_header.code_header_id AND record.plant_life_stage_code = plant_life_stage_codes.code_name::text
        LEFT JOIN invasivesbc.code_header plant_health_code_header ON plant_health_code_header.code_header_title::text = 'plant_health_code'::text AND plant_health_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code plant_health_codes ON plant_health_codes.code_header_id = plant_health_code_header.code_header_id AND record.plant_health_code = plant_health_codes.code_name::text
        LEFT JOIN invasivesbc.code_header plant_seed_stage_code_header ON plant_seed_stage_code_header.code_header_title::text = 'plant_seed_stage_code'::text AND plant_seed_stage_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code plant_seed_stage_codes ON plant_seed_stage_codes.code_header_id = plant_seed_stage_code_header.code_header_id AND record.plant_seed_stage_code = aspect_codes.code_name::text;

    -- Permissions

    ALTER TABLE invasivesbc.observation_terrestrialplant OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.observation_terrestrialplant TO invasivebc;


    -- invasivesbc.observations_by_species source

    CREATE OR REPLACE VIEW invasivesbc.observations_by_species
    AS WITH spatial_expload_positive AS (
            SELECT activity_incoming_data.activity_type,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.created_timestamp,
                activity_incoming_data.activity_incoming_data_id,
                jsonb_array_elements(activity_incoming_data.species_positive) AS species,
                geometry(activity_incoming_data.geog) AS geom
              FROM invasivesbc.activity_incoming_data
              WHERE activity_incoming_data.activity_type::text = 'Observation'::text AND activity_incoming_data.form_status::text = 'Submitted'::text AND (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.species_positive IS NOT NULL AND activity_incoming_data.species_positive::text !~~ 'null'::text
            ), spatial_positive AS (
            SELECT spatial_expload_positive.activity_type,
                spatial_expload_positive.activity_subtype,
                spatial_expload_positive.created_timestamp,
                spatial_expload_positive.activity_incoming_data_id,
                spatial_expload_positive.species,
                    CASE
                        WHEN st_geometrytype(spatial_expload_positive.geom) = 'ST_Point'::text THEN st_buffer(spatial_expload_positive.geom::geography, 0.56425::double precision, 'quad_segs=30'::text)::geometry
                        ELSE spatial_expload_positive.geom
                    END AS geom
              FROM spatial_expload_positive
            ), spatial_expload_negative AS (
            SELECT activity_incoming_data.activity_subtype,
                activity_incoming_data.created_timestamp,
                activity_incoming_data.activity_incoming_data_id,
                jsonb_array_elements(activity_incoming_data.species_negative) AS species,
                geometry(activity_incoming_data.geog) AS geom
              FROM invasivesbc.activity_incoming_data
              WHERE activity_incoming_data.activity_type::text = 'Observation'::text AND activity_incoming_data.form_status::text = 'Submitted'::text AND (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.species_negative IS NOT NULL AND activity_incoming_data.species_negative::text !~~ 'null'::text
            ), spatial_negative AS (
            SELECT spatial_expload_negative.activity_subtype,
                spatial_expload_negative.created_timestamp,
                spatial_expload_negative.activity_incoming_data_id,
                spatial_expload_negative.species,
                    CASE
                        WHEN st_geometrytype(spatial_expload_negative.geom) = 'ST_Point'::text THEN st_buffer(spatial_expload_negative.geom::geography, 0.56425::double precision, 'quad_segs=30'::text)::geometry
                        ELSE spatial_expload_negative.geom
                    END AS geom
              FROM spatial_expload_negative
            ), spatial_positive_negative AS (
            SELECT row_number() OVER () AS ctid,
                pos.species #>> '{}'::text[] AS species,
                pos.activity_type,
                pos.created_timestamp,
                pos.activity_incoming_data_id,
                    CASE
                        WHEN st_intersects(pos.geom, neg.geom) THEN st_difference(pos.geom, neg.geom)
                        ELSE pos.geom
                    END AS geom
              FROM spatial_positive pos
                LEFT JOIN spatial_negative neg ON st_intersects(pos.geom, neg.geom) AND pos.species = neg.species AND pos.created_timestamp < neg.created_timestamp
            ), spatial_full_overlap AS (
            SELECT t.activity_incoming_data_id,
                t.species,
                st_area(t.geom::geography, true) AS area,
                t.geom,
                t.created_timestamp,
                t.activity_type
              FROM spatial_positive_negative t
                JOIN ( SELECT a.activity_incoming_data_id,
                        min(st_area(a.geom::geography, true)) AS area
                      FROM spatial_positive_negative a,
                        spatial_positive_negative b
                      WHERE a.species = b.species AND st_contains(a.geom, b.geom) AND a.ctid <> b.ctid AND a.activity_incoming_data_id = b.activity_incoming_data_id
                      GROUP BY a.activity_incoming_data_id) m ON t.activity_incoming_data_id = m.activity_incoming_data_id
              WHERE st_area(t.geom::geography, true) = m.area
            ), spatial_partial_overlap AS (
            SELECT a.activity_incoming_data_id,
                a.species,
                st_intersection(a.geom, b.geom) AS geom,
                a.created_timestamp,
                a.activity_type
              FROM spatial_positive_negative a,
                spatial_positive_negative b
              WHERE a.species = b.species AND st_intersects(a.geom, b.geom) AND a.ctid <> b.ctid AND a.activity_incoming_data_id = b.activity_incoming_data_id AND NOT (a.activity_incoming_data_id IN ( SELECT a_1.activity_incoming_data_id
                      FROM spatial_positive_negative a_1,
                        spatial_positive_negative b_1
                      WHERE a_1.species = b_1.species AND st_contains(a_1.geom, b_1.geom) AND a_1.ctid <> b_1.ctid AND a_1.activity_incoming_data_id = b_1.activity_incoming_data_id
                      GROUP BY a_1.activity_incoming_data_id))
              GROUP BY a.activity_incoming_data_id, a.species, a.geom, b.geom, a.created_timestamp, a.activity_type
            ), spatial_others AS (
            SELECT spatial_positive_negative.activity_incoming_data_id,
                spatial_positive_negative.species,
                spatial_positive_negative.geom,
                spatial_positive_negative.created_timestamp,
                spatial_positive_negative.activity_type
              FROM spatial_positive_negative
              WHERE NOT (spatial_positive_negative.activity_incoming_data_id IN ( SELECT a.activity_incoming_data_id
                      FROM spatial_positive_negative a,
                        spatial_positive_negative b
                      WHERE a.species = b.species AND st_intersects(a.geom, b.geom) AND a.ctid <> b.ctid AND a.activity_incoming_data_id = b.activity_incoming_data_id
                      GROUP BY a.activity_incoming_data_id))
            UNION
            SELECT spatial_full_overlap.activity_incoming_data_id,
                spatial_full_overlap.species,
                spatial_full_overlap.geom,
                spatial_full_overlap.created_timestamp,
                spatial_full_overlap.activity_type
              FROM spatial_full_overlap
            UNION
            SELECT spatial_partial_overlap.activity_incoming_data_id,
                spatial_partial_overlap.species,
                spatial_partial_overlap.geom,
                spatial_partial_overlap.created_timestamp,
                spatial_partial_overlap.activity_type
              FROM spatial_partial_overlap
            ), spatial_union AS (
            SELECT spatial_others.species,
                invasive_plant_codes.code_description AS terrestrial_invasive_plant,
                invasive_plant_aquatic_codes.code_description AS aquatic_invasive_plant,
                spatial_others.activity_type,
                max(spatial_others.created_timestamp) AS max_created_timestamp,
                array_agg(spatial_others.activity_incoming_data_id) AS activity_ids,
                st_union(st_collectionextract(st_transform(spatial_others.geom, 3005), 3)) AS geom
              FROM spatial_others
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND spatial_others.species = invasive_plant_codes.code_name::text
                LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON invasive_plant_aquatic_code_header.code_header_title::text = 'invasive_plant_aquatic_code'::text AND invasive_plant_aquatic_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id AND spatial_others.species = invasive_plant_aquatic_codes.code_name::text
              GROUP BY spatial_others.species, invasive_plant_codes.code_description, invasive_plant_aquatic_codes.code_description, spatial_others.activity_type
            )
    SELECT spatial_union.species,
        COALESCE(spatial_union.terrestrial_invasive_plant, spatial_union.aquatic_invasive_plant) AS invasive_plant,
        st_area(spatial_union.geom) AS area_sqm,
        spatial_union.max_created_timestamp,
        spatial_union.geom
      FROM spatial_union
      WHERE st_area(spatial_union.geom) > 0::double precision;

    -- Permissions

    ALTER TABLE invasivesbc.observations_by_species OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.observations_by_species TO invasivebc;

    -- invasivesbc.treatment_summary source

    CREATE OR REPLACE VIEW invasivesbc.treatment_summary
    AS SELECT activity_incoming_data.activity_id,
        activity_incoming_data.activity_subtype AS observation_type,
        activity_incoming_data.version,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'activity_date_time'::text AS activity_date_time,
        activity_incoming_data.created_timestamp AS submitted_time,
        activity_incoming_data.received_timestamp,
        activity_incoming_data.deleted_timestamp,
        activity_incoming_data.biogeoclimatic_zones,
        activity_incoming_data.regional_invasive_species_organization_areas,
        activity_incoming_data.invasive_plant_management_areas,
        activity_incoming_data.ownership,
        activity_incoming_data.regional_districts,
        activity_incoming_data.flnro_districts,
        activity_incoming_data.moti_districts,
        activity_incoming_data.elevation,
        activity_incoming_data.well_proximity,
        activity_incoming_data.utm_zone,
        activity_incoming_data.utm_northing,
        activity_incoming_data.utm_easting,
        activity_incoming_data.albers_northing,
        activity_incoming_data.albers_easting,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'latitude'::text AS latitude,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'longitude'::text AS longitude,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'reported_area'::text AS reported_area,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'invasive_species_agency_code'::text AS invasive_species_agency_code,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'general_comment'::text AS general_comment,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'access_description'::text AS access_description,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'jurisdictions'::text AS jurisdictions,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'project_code'::text AS project_code,
        activity_incoming_data.geom,
        activity_incoming_data.geog,
        activity_incoming_data.media_keys,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_type_data'::text) -> 'observer_last_name'::text AS primary_user_last_name,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_type_data'::text) -> 'observer_first_name'::text AS primary_user_first_name,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'acitivity_subtype_data'::text) -> 'invasive_plant_code'::text AS invasive_plant_code,
        ((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_data'::text) -> 'general_comment'::text AS general_observation_comment__needs_verify
      FROM invasivesbc.activity_incoming_data
      WHERE activity_incoming_data.activity_type::text = 'Treatment'::text AND activity_incoming_data.deleted_timestamp IS NULL;

    -- Permissions

    ALTER TABLE invasivesbc.treatment_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.treatment_summary TO invasivebc;

    -- invasivesbc.treatment_biological_terrestrialplant source

    CREATE OR REPLACE VIEW invasivesbc.treatment_biological_terrestrialplant
    AS SELECT record.activity_id,
        summary.version,
        summary.activity_date_time,
        summary.submitted_time,
        summary.received_timestamp,
        summary.deleted_timestamp,
        summary.biogeoclimatic_zones,
        summary.regional_invasive_species_organization_areas,
        summary.invasive_plant_management_areas,
        summary.ownership,
        summary.regional_districts,
        summary.flnro_districts,
        summary.moti_districts,
        summary.elevation,
        summary.well_proximity,
        summary.utm_zone,
        summary.utm_northing,
        summary.utm_easting,
        summary.albers_northing,
        summary.albers_easting,
        summary.latitude,
        summary.longitude,
        summary.reported_area,
        summary.invasive_species_agency_code,
        summary.general_comment,
        summary.access_description,
        summary.jurisdictions,
        summary.project_code,
        summary.geom,
        summary.geog,
        summary.media_keys,
        record.invasive_plant_code,
        invasive_plant_codes.code_description AS invasive_plant,
        record.classified_area_code,
        classified_area_codes.code_description AS classified_area,
        record.applicator1_licence_number,
        record.agent_source,
        biological_agent_codes.code_description AS biological_agent,
        record.biological_agent_stage_code,
        record.bioagent_maturity_status_code,
        bioagent_maturity_status_codes.code_description AS bioagent_maturity_status
      FROM invasivesbc.activity_treatment_biological_terrestrialplant_with_codes record
        JOIN invasivesbc.treatment_summary summary ON summary.activity_id = record.activity_id
        LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND record.invasive_plant_code = invasive_plant_codes.code_name::text
        LEFT JOIN invasivesbc.code_header classified_area_code_header ON classified_area_code_header.code_header_title::text = 'classified_area_code'::text AND classified_area_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code classified_area_codes ON classified_area_codes.code_header_id = classified_area_code_header.code_header_id AND record.classified_area_code = classified_area_codes.code_name::text
        LEFT JOIN invasivesbc.code_header biological_agent_code_header ON biological_agent_code_header.code_header_title::text = 'biological_agent_code'::text AND biological_agent_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code biological_agent_codes ON biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id AND record.biological_agent_code = biological_agent_codes.code_name::text
        LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON biological_agent_stage_code_header.code_header_title::text = 'biological_agent_stage_code'::text AND biological_agent_stage_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code biological_agent_stage_codes ON biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id AND record.biological_agent_stage_code = biological_agent_stage_codes.code_name::text
        LEFT JOIN invasivesbc.code_header bioagent_maturity_status_code_header ON bioagent_maturity_status_code_header.code_header_title::text = 'bioagent_maturity_status_code'::text AND bioagent_maturity_status_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code bioagent_maturity_status_codes ON bioagent_maturity_status_codes.code_header_id = bioagent_maturity_status_code_header.code_header_id AND record.bioagent_maturity_status_code = bioagent_maturity_status_codes.code_name::text;

    -- Permissions

    ALTER TABLE invasivesbc.treatment_biological_terrestrialplant OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.treatment_biological_terrestrialplant TO invasivebc;


    -- invasivesbc.treatment_chemical_aquatic_plant_summary source

    CREATE OR REPLACE VIEW invasivesbc.treatment_chemical_aquatic_plant_summary
    AS WITH herbicide_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object}'::text[] AS json_data,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,herbicides}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND (activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[]) = 'false'::text AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantAquatic'::text AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), tank_mix_herbicide_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object}'::text[] AS json_data,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object,herbicides}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND (activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[]) = 'true'::text AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantAquatic'::text AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), invasive_plant_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,invasive_plants}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantAquatic'::text AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), calculation_json AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results}'::text[] AS json_data
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantAquatic'::text AND activity_incoming_data.form_status::text = 'Submitted'::text AND jsonb_array_length(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,invasive_plants}'::text[]) = 1 AND jsonb_array_length(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,herbicides}'::text[]) = 1
            ), calculation_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results}'::text[] AS json_data,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results,invasive_plants}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantAquatic'::text AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), calculation_herbicide_array AS (
            SELECT c_1.activity_incoming_data_id,
                c_1.activity_subtype,
                c_1.tank_mix,
                jsonb_array_elements(c_1.json_array #> '{herbicides}'::text[]) AS json_array
              FROM calculation_array c_1
              WHERE (c_1.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND c_1.activity_subtype::text = 'Activity_Treatment_ChemicalPlantAquatic'::text
            ), tank_mix_herbicide_select AS (
            SELECT t.activity_incoming_data_id,
                t.json_array #>> '{herbicide_code}'::text[] AS herbicide_code,
                liquid_herbicide_codes.code_description AS liquid_herbicide,
                granular_herbicide_codes.code_description AS granular_herbicide,
                t.json_array #>> '{herbicide_type_code}'::text[] AS herbicide_type_code,
                herbicide_type_codes.code_description AS herbicide_type,
                t.json_array #>> '{product_application_rate}'::text[] AS product_application_rate,
                t.json_data #>> '{amount_of_mix}'::text[] AS amount_of_mix,
                t.json_data #>> '{calculation_type}'::text[] AS calculation_type_code,
                calculation_type_codes.code_description AS calculation_type,
                t.json_data #>> '{delivery_rate_of_mix}'::text[] AS delivery_rate_of_mix,
                t.json_array #>> '{index}'::text[] AS tank_mix_herbicide_index,
                concat(t.activity_incoming_data_id, '-index-', t.json_array #>> '{index}'::text[]) AS tank_mix_herbicide_id
              FROM tank_mix_herbicide_array t
                LEFT JOIN invasivesbc.code_header liquid_herbicide_code_header ON liquid_herbicide_code_header.code_header_title::text = 'liquid_herbicide_code'::text AND liquid_herbicide_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code liquid_herbicide_codes ON liquid_herbicide_codes.code_header_id = liquid_herbicide_code_header.code_header_id AND (t.json_array #>> '{herbicide_code}'::text[]) = liquid_herbicide_codes.code_name::text
                LEFT JOIN invasivesbc.code_header granular_herbicide_code_header ON granular_herbicide_code_header.code_header_title::text = 'granular_herbicide_code'::text AND granular_herbicide_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code granular_herbicide_codes ON granular_herbicide_codes.code_header_id = granular_herbicide_code_header.code_header_id AND (t.json_array #>> '{herbicide_code}'::text[]) = granular_herbicide_codes.code_name::text
                LEFT JOIN invasivesbc.code_header calculation_type_code_header ON calculation_type_code_header.code_header_title::text = 'calculation_type_code'::text AND calculation_type_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code calculation_type_codes ON calculation_type_codes.code_header_id = calculation_type_code_header.code_header_id AND (t.json_data #>> '{calculation_type}'::text[]) = calculation_type_codes.code_name::text
                LEFT JOIN invasivesbc.code_header herbicide_type_code_header ON herbicide_type_code_header.code_header_title::text = 'herbicide_type_code'::text AND herbicide_type_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code herbicide_type_codes ON herbicide_type_codes.code_header_id = herbicide_type_code_header.code_header_id AND (t.json_array #>> '{herbicide_type_code}'::text[]) = herbicide_type_codes.code_name::text
              WHERE (t.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            ), herbicide_select AS (
            SELECT t.activity_incoming_data_id,
                t.json_array #>> '{herbicide_code}'::text[] AS herbicide_code,
                liquid_herbicide_codes.code_description AS liquid_herbicide,
                granular_herbicide_codes.code_description AS granular_herbicide,
                t.json_array #>> '{herbicide_type_code}'::text[] AS herbicide_type_code,
                herbicide_type_codes.code_description AS herbicide_type,
                t.json_array #>> '{product_application_rate}'::text[] AS product_application_rate,
                t.json_array #>> '{amount_of_mix}'::text[] AS amount_of_mix,
                t.json_array #>> '{dilution}'::text[] AS dilution,
                t.json_array #>> '{area_treated_sqm}'::text[] AS area_treated_sqm,
                c_1.json_data #>> '{dilution}'::text[] AS dilution2,
                c_1.json_data #>> '{area_treated_sqm}'::text[] AS area_treated_sqm2,
                c_1.json_data #>> '{percent_area_covered}'::text[] AS percent_area_covered2,
                c_1.json_data #>> '{area_treated_hectares}'::text[] AS area_treated_hectares2,
                c_1.json_data #>> '{amount_of_undiluted_herbicide_used_liters}'::text[] AS amount_of_undiluted_herbicide_used_liters2,
                t.json_array #>> '{calculation_type}'::text[] AS calculation_type_code,
                calculation_type_codes.code_description AS calculation_type,
                t.json_array #>> '{delivery_rate_of_mix}'::text[] AS delivery_rate_of_mix,
                concat(t.activity_incoming_data_id, '-index-', t.json_array #>> '{index}'::text[]) AS herbicide_id
              FROM herbicide_array t
                LEFT JOIN calculation_json c_1 ON c_1.activity_incoming_data_id = t.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header liquid_herbicide_code_header ON liquid_herbicide_code_header.code_header_title::text = 'liquid_herbicide_code'::text AND liquid_herbicide_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code liquid_herbicide_codes ON liquid_herbicide_codes.code_header_id = liquid_herbicide_code_header.code_header_id AND (t.json_array #>> '{herbicide_code}'::text[]) = liquid_herbicide_codes.code_name::text
                LEFT JOIN invasivesbc.code_header granular_herbicide_code_header ON granular_herbicide_code_header.code_header_title::text = 'granular_herbicide_code'::text AND granular_herbicide_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code granular_herbicide_codes ON granular_herbicide_codes.code_header_id = granular_herbicide_code_header.code_header_id AND (t.json_array #>> '{herbicide_code}'::text[]) = granular_herbicide_codes.code_name::text
                LEFT JOIN invasivesbc.code_header calculation_type_code_header ON calculation_type_code_header.code_header_title::text = 'calculation_type_code'::text AND calculation_type_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code calculation_type_codes ON calculation_type_codes.code_header_id = calculation_type_code_header.code_header_id AND (t.json_array #>> '{calculation_type}'::text[]) = calculation_type_codes.code_name::text
                LEFT JOIN invasivesbc.code_header herbicide_type_code_header ON herbicide_type_code_header.code_header_title::text = 'herbicide_type_code'::text AND herbicide_type_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code herbicide_type_codes ON herbicide_type_codes.code_header_id = herbicide_type_code_header.code_header_id AND (t.json_array #>> '{herbicide_type_code}'::text[]) = herbicide_type_codes.code_name::text
              WHERE (t.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            ), calculation_array_select AS (
            SELECT i.activity_incoming_data_id,
                i.json_data #>> '{dilution}'::text[] AS dilution,
                i.json_array #>> '{area_treated_hectares}'::text[] AS area_treated_hectares,
                i.json_array #>> '{area_treated_ha}'::text[] AS area_treated_ha,
                i.json_array #>> '{area_treated_sqm}'::text[] AS area_treated_sqm,
                i.json_array #>> '{amount_of_mix_used}'::text[] AS amount_of_mix_used,
                i.json_array #>> '{percent_area_covered}'::text[] AS percent_area_covered,
                i.json_array #>> '{percentage_area_covered}'::text[] AS percentage_area_covered,
                i.json_array #>> '{amount_of_undiluted_herbicide_used_liters}'::text[] AS amount_of_undiluted_herbicide_used_liters,
                concat(i.activity_incoming_data_id, '-index-', i.json_array #>> '{index}'::text[]) AS calculation_invasive_plant_id
              FROM calculation_array i
              WHERE (i.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            ), calculation_herbicide_array_select AS (
            SELECT h.activity_incoming_data_id,
                h.json_array #>> '{herbIndex}'::text[] AS herbindex,
                h.json_array #>> '{plantIndex}'::text[] AS plantindex,
                h.json_array #>> '{dilution}'::text[] AS dilution,
                h.json_array #>> '{amount_of_undiluted_herbicide_used_liters}'::text[] AS amount_of_undiluted_herbicide_used_liters,
                concat(h.activity_incoming_data_id, '-index-', h.json_array #>> '{plantIndex}'::text[]) AS calculation_herbicide_id
              FROM calculation_herbicide_array h
            ), invasive_plant_array_select AS (
            SELECT i.activity_incoming_data_id,
                i.json_array #>> '{invasive_plant_code}'::text[] AS invasive_plant_code,
                invasive_plant_codes.code_description AS invasive_plant,
                i.json_array #>> '{percent_area_covered}'::text[] AS percent_area_covered,
                i.json_array #>> '{index}'::text[] AS invasive_plant_index,
                concat(i.activity_incoming_data_id, '-index-', i.json_array #>> '{index}'::text[]) AS invasive_plant_id
              FROM invasive_plant_array i
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_aquatic_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND (i.json_array #>> '{invasive_plant_code}'::text[]) = invasive_plant_codes.code_name::text
            ), not_tank_mix_plant_herbicide_join AS (
            SELECT i.activity_incoming_data_id,
                i.invasive_plant,
                i.percent_area_covered AS ip_percent_area_covered,
                i.invasive_plant_id,
                concat(h.liquid_herbicide, h.granular_herbicide) AS herbicide,
                h.herbicide_type,
                h.product_application_rate,
                h.amount_of_mix,
                h.calculation_type,
                h.delivery_rate_of_mix,
                h.herbicide_id,
                concat(h.area_treated_sqm, c_1.area_treated_sqm, h.area_treated_sqm2) AS area_treated_sqm,
                c_1.amount_of_mix_used,
                concat(c_1.area_treated_hectares, h.area_treated_hectares2) AS area_treated_hectares,
                concat(c_1.percentage_area_covered, c_1.percent_area_covered, h.percent_area_covered2) AS percentage_area_covered,
                concat(c_1.amount_of_undiluted_herbicide_used_liters, h.amount_of_undiluted_herbicide_used_liters2) AS amount_of_undiluted_herbicide_used_liters,
                concat(h.dilution, h.dilution2) AS dilution
              FROM invasive_plant_array_select i
                JOIN herbicide_select h ON h.activity_incoming_data_id = i.activity_incoming_data_id
                LEFT JOIN calculation_array_select c_1 ON c_1.calculation_invasive_plant_id = i.invasive_plant_id
            ), tank_mix_plant_results_select AS (
            SELECT h.activity_incoming_data_id,
                h.calculation_herbicide_id,
                concat(h.activity_incoming_data_id, '-index-', h.herbindex, h.plantindex) AS results_herbicide_plant_index,
                h.dilution,
                h.amount_of_undiluted_herbicide_used_liters,
                c_1.calculation_invasive_plant_id,
                c_1.area_treated_ha,
                c_1.area_treated_sqm,
                c_1.amount_of_mix_used,
                c_1.percent_area_covered
              FROM calculation_herbicide_array_select h
                JOIN calculation_array_select c_1 ON c_1.calculation_invasive_plant_id = h.calculation_herbicide_id
            ), invasive_plant_herbicide AS (
            SELECT i.activity_incoming_data_id,
                concat(i.activity_incoming_data_id, '-index-', h.tank_mix_herbicide_index, i.invasive_plant_index) AS herbicide_plant_index,
                i.invasive_plant,
                i.percent_area_covered,
                i.invasive_plant_id,
                h.tank_mix_herbicide_index,
                concat(h.liquid_herbicide, h.granular_herbicide) AS herbicide,
                h.herbicide_type,
                h.product_application_rate,
                h.amount_of_mix,
                h.calculation_type,
                h.delivery_rate_of_mix,
                h.tank_mix_herbicide_id
              FROM invasive_plant_array_select i
                JOIN tank_mix_herbicide_select h ON h.activity_incoming_data_id = i.activity_incoming_data_id
            ), tank_mix_results_select AS (
            SELECT i.activity_incoming_data_id,
                i.invasive_plant,
                i.percent_area_covered AS ip_percent_area_covered,
                i.invasive_plant_id,
                i.herbicide,
                i.herbicide_type,
                i.product_application_rate,
                i.amount_of_mix,
                i.calculation_type,
                i.delivery_rate_of_mix,
                i.tank_mix_herbicide_id,
                c_1.calculation_herbicide_id,
                c_1.dilution,
                c_1.amount_of_undiluted_herbicide_used_liters,
                c_1.calculation_invasive_plant_id,
                c_1.area_treated_ha,
                c_1.area_treated_sqm,
                c_1.amount_of_mix_used,
                c_1.percent_area_covered
              FROM invasive_plant_herbicide i
                LEFT JOIN tank_mix_plant_results_select c_1 ON c_1.results_herbicide_plant_index = i.herbicide_plant_index
            ), jurisdiction_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_data,jurisdictions}'::text[]) AS jurisdictions_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantAquatic'::text
            ), jurisdiction_array_select AS (
            SELECT j_1.activity_incoming_data_id,
                j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[] AS jurisdiction_code,
                jurisdiction_codes.code_description AS jurisdiction,
                j_1.jurisdictions_array #>> '{percent_covered}'::text[] AS percent_covered
              FROM jurisdiction_array j_1
                LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON jurisdiction_code_header.code_header_title::text = 'jurisdiction_code'::text AND jurisdiction_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code jurisdiction_codes ON jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id AND (j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) = jurisdiction_codes.code_name::text
            ), form_data AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.form_status,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data}'::text[] AS form_data
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantAquatic'::text AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), json_select AS (
            SELECT f.activity_incoming_data_id,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[] AS service_license_company,
                service_license_codes.code_description AS service_license,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_use_permit_PUP}'::text[] AS pesticide_use_permit,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pest_management_plan}'::text[] AS pest_management_plan,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,temperature}'::text[] AS temperature,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,wind_speed}'::text[] AS wind_speed,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,wind_direction_code}'::text[] AS wind_direction,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,humidity}'::text[] AS humidity,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,signage_on_site}'::text[] AS treatment_notice_signs,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,application_start_time}'::text[] AS application_start_time,
                h.invasive_plant,
                COALESCE(h.ip_percent_area_covered, '100'::text) AS ip_percent_area_covered,
                j_1.jurisdiction,
                j_1.percent_covered,
                f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                f.form_data #>> '{chemical_treatment_details,chemical_application_method}'::text[] AS chemical_application_method_code,
                chemical_method_codes.code_description AS chemical_application_method,
                h.herbicide_type,
                h.herbicide,
                h.calculation_type,
                h.amount_of_mix,
                h.delivery_rate_of_mix,
                h.product_application_rate,
                h.dilution,
                h.amount_of_undiluted_herbicide_used_liters,
                h.area_treated_hectares,
                h.area_treated_sqm,
                h.amount_of_mix_used,
                h.percentage_area_covered
              FROM form_data f
                JOIN not_tank_mix_plant_herbicide_join h ON h.activity_incoming_data_id = f.activity_incoming_data_id
                LEFT JOIN jurisdiction_array_select j_1 ON j_1.activity_incoming_data_id = f.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header chemical_method_code_header ON chemical_method_code_header.code_header_title::text = 'chemical_method_code'::text AND chemical_method_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code chemical_method_codes ON chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id AND (f.form_data #>> '{chemical_treatment_details,chemical_application_method}'::text[]) = chemical_method_codes.code_name::text
                LEFT JOIN invasivesbc.code_header service_license_code_header ON service_license_code_header.code_header_title::text = 'service_license_code'::text AND service_license_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code service_license_codes ON service_license_codes.code_header_id = service_license_code_header.code_header_id AND (f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[]) = service_license_codes.code_name::text
              WHERE f.activity_subtype::text = 'Activity_Treatment_ChemicalPlantAquatic'::text AND (f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[]) = 'false'::text AND (f.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND f.form_status::text = 'Submitted'::text
            ), tank_mix_json_select AS (
            SELECT f.activity_incoming_data_id,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[] AS service_license_company,
                service_license_codes.code_description AS service_license,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_use_permit_PUP}'::text[] AS pesticide_use_permit,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pest_management_plan}'::text[] AS pest_management_plan,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,temperature}'::text[] AS temperature,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,wind_speed}'::text[] AS wind_speed,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,wind_direction_code}'::text[] AS wind_direction,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,humidity}'::text[] AS humidity,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,signage_on_site}'::text[] AS treatment_notice_signs,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,application_start_time}'::text[] AS application_start_time,
                tm_1.invasive_plant,
                COALESCE(tm_1.ip_percent_area_covered, '100'::text) AS ip_percent_area_covered,
                j_1.jurisdiction,
                j_1.percent_covered,
                f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                f.form_data #>> '{chemical_treatment_details,chemical_application_method}'::text[] AS chemical_application_method_code,
                chemical_method_codes.code_description AS chemical_application_method,
                tm_1.herbicide_type,
                tm_1.herbicide,
                tm_1.calculation_type,
                tm_1.amount_of_mix,
                tm_1.delivery_rate_of_mix,
                tm_1.product_application_rate,
                tm_1.dilution,
                tm_1.amount_of_undiluted_herbicide_used_liters,
                tm_1.area_treated_ha AS area_treated_hectares,
                tm_1.area_treated_sqm,
                tm_1.amount_of_mix_used,
                tm_1.percent_area_covered AS percentage_area_covered
              FROM form_data f
                LEFT JOIN tank_mix_results_select tm_1 ON tm_1.activity_incoming_data_id = f.activity_incoming_data_id
                LEFT JOIN jurisdiction_array_select j_1 ON j_1.activity_incoming_data_id = f.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header chemical_method_code_header ON chemical_method_code_header.code_header_title::text = 'chemical_method_code'::text AND chemical_method_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code chemical_method_codes ON chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id AND (f.form_data #>> '{chemical_treatment_details,chemical_application_method}'::text[]) = chemical_method_codes.code_name::text
                LEFT JOIN invasivesbc.code_header service_license_code_header ON service_license_code_header.code_header_title::text = 'service_license_code'::text AND service_license_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code service_license_codes ON service_license_codes.code_header_id = service_license_code_header.code_header_id AND (f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[]) = service_license_codes.code_name::text
              WHERE f.activity_subtype::text = 'Activity_Treatment_ChemicalPlantAquatic'::text AND (f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[]) = 'true'::text AND (f.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND f.form_status::text = 'Submitted'::text
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        concat(j.jurisdiction, tm.jurisdiction, ' ', j.percent_covered, tm.percent_covered, '%') AS jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.treatment_person,
        c.well_proximity,
        j.service_license,
        concat(tm.pesticide_use_permit, j.pesticide_use_permit) AS pesticide_use_permit,
        concat(tm.pest_management_plan, j.pest_management_plan) AS pest_management_plan,
        concat(tm.temperature, j.temperature) AS temperature_celsius,
        concat(tm.wind_speed, j.wind_speed) AS wind_speed_km,
        concat(tm.wind_direction, j.wind_direction) AS wind_direction,
        concat(tm.humidity, j.humidity) AS humidity_percent,
        concat(tm.treatment_notice_signs, j.treatment_notice_signs) AS treatment_notice_signs,
        concat(tm.application_start_time, j.application_start_time) AS application_start_time,
        concat(tm.invasive_plant, j.invasive_plant) AS invasive_plant,
        concat(tm.ip_percent_area_covered, j.ip_percent_area_covered, '%') AS invasive_plant_percent,
            CASE
                WHEN concat(tm.tank_mix, j.tank_mix) = 'false'::text THEN 'No'::text
                ELSE 'Yes'::text
            END AS tank_mix,
        concat(tm.chemical_application_method, j.chemical_application_method) AS chemical_application_method,
        concat(tm.herbicide_type, j.herbicide_type) AS herbicide_type,
        concat(tm.herbicide, j.herbicide) AS herbicide,
        concat(tm.calculation_type, j.calculation_type) AS calculation_type,
        concat(tm.delivery_rate_of_mix, j.delivery_rate_of_mix) AS delivery_rate_of_mix,
        concat(tm.product_application_rate, j.product_application_rate) AS product_application_rate,
        concat(tm.dilution, j.dilution) AS dilution,
        concat(tm.percent_covered, j.percent_covered)::double precision / 100::double precision * concat(tm.amount_of_undiluted_herbicide_used_liters, j.amount_of_undiluted_herbicide_used_liters)::double precision AS amount_of_undiluted_herbicide_used_liters,
        concat(tm.percent_covered, j.percent_covered)::double precision / 100::double precision * concat(tm.area_treated_hectares, j.area_treated_hectares)::double precision AS area_treated_hectares,
        concat(tm.percent_covered, j.percent_covered)::double precision / 100::double precision * concat(tm.area_treated_sqm, j.area_treated_sqm)::double precision AS area_treated_sqm,
        concat(tm.percent_covered, j.percent_covered)::double precision / 100::double precision * concat(tm.amount_of_mix_used, j.amount_of_mix)::double precision AS amount_of_mix_used,
        c.elevation,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        LEFT JOIN json_select j ON j.activity_incoming_data_id = c.activity_incoming_data_id
        LEFT JOIN tank_mix_json_select tm ON tm.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.treatment_chemical_aquatic_plant_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.treatment_chemical_aquatic_plant_summary TO invasivebc;


    -- invasivesbc.treatment_chemical_terrestrial_plant_summary source

    CREATE OR REPLACE VIEW invasivesbc.treatment_chemical_terrestrial_plant_summary
    AS WITH herbicide_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object}'::text[] AS json_data,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,herbicides}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND (activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[]) = 'false'::text AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantTerrestrial'::text AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), tank_mix_herbicide_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object}'::text[] AS json_data,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object,herbicides}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND (activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[]) = 'true'::text AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantTerrestrial'::text AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), invasive_plant_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,invasive_plants}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantTerrestrial'::text AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), calculation_json AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results}'::text[] AS json_data
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantTerrestrial'::text AND activity_incoming_data.form_status::text = 'Submitted'::text AND jsonb_array_length(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,invasive_plants}'::text[]) = 1 AND jsonb_array_length(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,herbicides}'::text[]) = 1
            ), calculation_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.activity_payload #>> '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results}'::text[] AS json_data,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results,invasive_plants}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantTerrestrial'::text AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), calculation_herbicide_array AS (
            SELECT c_1.activity_incoming_data_id,
                c_1.activity_subtype,
                c_1.tank_mix,
                jsonb_array_elements(c_1.json_array #> '{herbicides}'::text[]) AS json_array
              FROM calculation_array c_1
              WHERE (c_1.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND c_1.activity_subtype::text = 'Activity_Treatment_ChemicalPlantTerrestrial'::text
            ), tank_mix_herbicide_select AS (
            SELECT t.activity_incoming_data_id,
                t.json_array #>> '{herbicide_code}'::text[] AS herbicide_code,
                liquid_herbicide_codes.code_description AS liquid_herbicide,
                granular_herbicide_codes.code_description AS granular_herbicide,
                t.json_array #>> '{herbicide_type_code}'::text[] AS herbicide_type_code,
                herbicide_type_codes.code_description AS herbicide_type,
                t.json_array #>> '{product_application_rate}'::text[] AS product_application_rate,
                t.json_data #>> '{amount_of_mix}'::text[] AS amount_of_mix,
                t.json_data #>> '{calculation_type}'::text[] AS calculation_type_code,
                calculation_type_codes.code_description AS calculation_type,
                t.json_data #>> '{delivery_rate_of_mix}'::text[] AS delivery_rate_of_mix,
                t.json_array #>> '{index}'::text[] AS tank_mix_herbicide_index,
                concat(t.activity_incoming_data_id, '-index-', t.json_array #>> '{index}'::text[]) AS tank_mix_herbicide_id
              FROM tank_mix_herbicide_array t
                LEFT JOIN invasivesbc.code_header liquid_herbicide_code_header ON liquid_herbicide_code_header.code_header_title::text = 'liquid_herbicide_code'::text AND liquid_herbicide_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code liquid_herbicide_codes ON liquid_herbicide_codes.code_header_id = liquid_herbicide_code_header.code_header_id AND (t.json_array #>> '{herbicide_code}'::text[]) = liquid_herbicide_codes.code_name::text
                LEFT JOIN invasivesbc.code_header granular_herbicide_code_header ON granular_herbicide_code_header.code_header_title::text = 'granular_herbicide_code'::text AND granular_herbicide_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code granular_herbicide_codes ON granular_herbicide_codes.code_header_id = granular_herbicide_code_header.code_header_id AND (t.json_array #>> '{herbicide_code}'::text[]) = granular_herbicide_codes.code_name::text
                LEFT JOIN invasivesbc.code_header calculation_type_code_header ON calculation_type_code_header.code_header_title::text = 'calculation_type_code'::text AND calculation_type_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code calculation_type_codes ON calculation_type_codes.code_header_id = calculation_type_code_header.code_header_id AND (t.json_data #>> '{calculation_type}'::text[]) = calculation_type_codes.code_name::text
                LEFT JOIN invasivesbc.code_header herbicide_type_code_header ON herbicide_type_code_header.code_header_title::text = 'herbicide_type_code'::text AND herbicide_type_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code herbicide_type_codes ON herbicide_type_codes.code_header_id = herbicide_type_code_header.code_header_id AND (t.json_array #>> '{herbicide_type_code}'::text[]) = herbicide_type_codes.code_name::text
              WHERE (t.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            ), herbicide_select AS (
            SELECT t.activity_incoming_data_id,
                t.json_array #>> '{herbicide_code}'::text[] AS herbicide_code,
                liquid_herbicide_codes.code_description AS liquid_herbicide,
                granular_herbicide_codes.code_description AS granular_herbicide,
                t.json_array #>> '{herbicide_type_code}'::text[] AS herbicide_type_code,
                herbicide_type_codes.code_description AS herbicide_type,
                t.json_array #>> '{product_application_rate}'::text[] AS product_application_rate,
                t.json_array #>> '{amount_of_mix}'::text[] AS amount_of_mix,
                t.json_array #>> '{dilution}'::text[] AS dilution,
                t.json_array #>> '{area_treated_sqm}'::text[] AS area_treated_sqm,
                c_1.json_data #>> '{dilution}'::text[] AS dilution2,
                c_1.json_data #>> '{area_treated_sqm}'::text[] AS area_treated_sqm2,
                c_1.json_data #>> '{percent_area_covered}'::text[] AS percent_area_covered2,
                c_1.json_data #>> '{area_treated_hectares}'::text[] AS area_treated_hectares2,
                c_1.json_data #>> '{amount_of_undiluted_herbicide_used_liters}'::text[] AS amount_of_undiluted_herbicide_used_liters2,
                t.json_array #>> '{calculation_type}'::text[] AS calculation_type_code,
                calculation_type_codes.code_description AS calculation_type,
                t.json_array #>> '{delivery_rate_of_mix}'::text[] AS delivery_rate_of_mix,
                concat(t.activity_incoming_data_id, '-index-', t.json_array #>> '{index}'::text[]) AS herbicide_id
              FROM herbicide_array t
                LEFT JOIN calculation_json c_1 ON c_1.activity_incoming_data_id = t.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header liquid_herbicide_code_header ON liquid_herbicide_code_header.code_header_title::text = 'liquid_herbicide_code'::text AND liquid_herbicide_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code liquid_herbicide_codes ON liquid_herbicide_codes.code_header_id = liquid_herbicide_code_header.code_header_id AND (t.json_array #>> '{herbicide_code}'::text[]) = liquid_herbicide_codes.code_name::text
                LEFT JOIN invasivesbc.code_header granular_herbicide_code_header ON granular_herbicide_code_header.code_header_title::text = 'granular_herbicide_code'::text AND granular_herbicide_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code granular_herbicide_codes ON granular_herbicide_codes.code_header_id = granular_herbicide_code_header.code_header_id AND (t.json_array #>> '{herbicide_code}'::text[]) = granular_herbicide_codes.code_name::text
                LEFT JOIN invasivesbc.code_header calculation_type_code_header ON calculation_type_code_header.code_header_title::text = 'calculation_type_code'::text AND calculation_type_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code calculation_type_codes ON calculation_type_codes.code_header_id = calculation_type_code_header.code_header_id AND (t.json_array #>> '{calculation_type}'::text[]) = calculation_type_codes.code_name::text
                LEFT JOIN invasivesbc.code_header herbicide_type_code_header ON herbicide_type_code_header.code_header_title::text = 'herbicide_type_code'::text AND herbicide_type_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code herbicide_type_codes ON herbicide_type_codes.code_header_id = herbicide_type_code_header.code_header_id AND (t.json_array #>> '{herbicide_type_code}'::text[]) = herbicide_type_codes.code_name::text
              WHERE (t.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            ), calculation_array_select AS (
            SELECT i.activity_incoming_data_id,
                i.json_data #>> '{dilution}'::text[] AS dilution,
                i.json_array #>> '{area_treated_hectares}'::text[] AS area_treated_hectares,
                i.json_array #>> '{area_treated_ha}'::text[] AS area_treated_ha,
                i.json_array #>> '{area_treated_sqm}'::text[] AS area_treated_sqm,
                i.json_array #>> '{amount_of_mix_used}'::text[] AS amount_of_mix_used,
                i.json_array #>> '{percent_area_covered}'::text[] AS percent_area_covered,
                i.json_array #>> '{percentage_area_covered}'::text[] AS percentage_area_covered,
                i.json_array #>> '{amount_of_undiluted_herbicide_used_liters}'::text[] AS amount_of_undiluted_herbicide_used_liters,
                concat(i.activity_incoming_data_id, '-index-', i.json_array #>> '{index}'::text[]) AS calculation_invasive_plant_id
              FROM calculation_array i
              WHERE (i.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            ), calculation_herbicide_array_select AS (
            SELECT h.activity_incoming_data_id,
                h.json_array #>> '{herbIndex}'::text[] AS herbindex,
                h.json_array #>> '{plantIndex}'::text[] AS plantindex,
                h.json_array #>> '{dilution}'::text[] AS dilution,
                h.json_array #>> '{amount_of_undiluted_herbicide_used_liters}'::text[] AS amount_of_undiluted_herbicide_used_liters,
                concat(h.activity_incoming_data_id, '-index-', h.json_array #>> '{plantIndex}'::text[]) AS calculation_herbicide_id
              FROM calculation_herbicide_array h
            ), invasive_plant_array_select AS (
            SELECT i.activity_incoming_data_id,
                i.json_array #>> '{invasive_plant_code}'::text[] AS invasive_plant_code,
                invasive_plant_codes.code_description AS invasive_plant,
                i.json_array #>> '{percent_area_covered}'::text[] AS percent_area_covered,
                i.json_array #>> '{index}'::text[] AS invasive_plant_index,
                concat(i.activity_incoming_data_id, '-index-', i.json_array #>> '{index}'::text[]) AS invasive_plant_id
              FROM invasive_plant_array i
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND (i.json_array #>> '{invasive_plant_code}'::text[]) = invasive_plant_codes.code_name::text
            ), not_tank_mix_plant_herbicide_join AS (
            SELECT i.activity_incoming_data_id,
                i.invasive_plant,
                i.percent_area_covered AS ip_percent_area_covered,
                i.invasive_plant_id,
                concat(h.liquid_herbicide, h.granular_herbicide) AS herbicide,
                h.herbicide_type,
                h.product_application_rate,
                h.amount_of_mix,
                h.calculation_type,
                h.delivery_rate_of_mix,
                h.herbicide_id,
                concat(h.area_treated_sqm, c_1.area_treated_sqm, h.area_treated_sqm2) AS area_treated_sqm,
                c_1.amount_of_mix_used,
                concat(c_1.area_treated_hectares, h.area_treated_hectares2) AS area_treated_hectares,
                concat(c_1.percentage_area_covered, c_1.percent_area_covered, h.percent_area_covered2) AS percentage_area_covered,
                concat(c_1.amount_of_undiluted_herbicide_used_liters, h.amount_of_undiluted_herbicide_used_liters2) AS amount_of_undiluted_herbicide_used_liters,
                concat(h.dilution, h.dilution2) AS dilution
              FROM invasive_plant_array_select i
                JOIN herbicide_select h ON h.activity_incoming_data_id = i.activity_incoming_data_id
                LEFT JOIN calculation_array_select c_1 ON c_1.calculation_invasive_plant_id = i.invasive_plant_id
            ), tank_mix_plant_results_select AS (
            SELECT h.activity_incoming_data_id,
                h.calculation_herbicide_id,
                concat(h.activity_incoming_data_id, '-index-', h.herbindex, h.plantindex) AS results_herbicide_plant_index,
                h.dilution,
                h.amount_of_undiluted_herbicide_used_liters,
                c_1.calculation_invasive_plant_id,
                c_1.area_treated_ha,
                c_1.area_treated_sqm,
                c_1.amount_of_mix_used,
                c_1.percent_area_covered
              FROM calculation_herbicide_array_select h
                JOIN calculation_array_select c_1 ON c_1.calculation_invasive_plant_id = h.calculation_herbicide_id
            ), invasive_plant_herbicide AS (
            SELECT i.activity_incoming_data_id,
                concat(i.activity_incoming_data_id, '-index-', h.tank_mix_herbicide_index, i.invasive_plant_index) AS herbicide_plant_index,
                i.invasive_plant,
                i.percent_area_covered,
                i.invasive_plant_id,
                h.tank_mix_herbicide_index,
                concat(h.liquid_herbicide, h.granular_herbicide) AS herbicide,
                h.herbicide_type,
                h.product_application_rate,
                h.amount_of_mix,
                h.calculation_type,
                h.delivery_rate_of_mix,
                h.tank_mix_herbicide_id
              FROM invasive_plant_array_select i
                JOIN tank_mix_herbicide_select h ON h.activity_incoming_data_id = i.activity_incoming_data_id
            ), tank_mix_results_select AS (
            SELECT i.activity_incoming_data_id,
                i.invasive_plant,
                i.percent_area_covered AS ip_percent_area_covered,
                i.invasive_plant_id,
                i.herbicide,
                i.herbicide_type,
                i.product_application_rate,
                i.amount_of_mix,
                i.calculation_type,
                i.delivery_rate_of_mix,
                i.tank_mix_herbicide_id,
                c_1.calculation_herbicide_id,
                c_1.dilution,
                c_1.amount_of_undiluted_herbicide_used_liters,
                c_1.calculation_invasive_plant_id,
                c_1.area_treated_ha,
                c_1.area_treated_sqm,
                c_1.amount_of_mix_used,
                c_1.percent_area_covered
              FROM invasive_plant_herbicide i
                LEFT JOIN tank_mix_plant_results_select c_1 ON c_1.results_herbicide_plant_index = i.herbicide_plant_index
            ), jurisdiction_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_data,jurisdictions}'::text[]) AS jurisdictions_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantTerrestrial'::text
            ), jurisdiction_array_select AS (
            SELECT j_1.activity_incoming_data_id,
                j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[] AS jurisdiction_code,
                jurisdiction_codes.code_description AS jurisdiction,
                j_1.jurisdictions_array #>> '{percent_covered}'::text[] AS percent_covered
              FROM jurisdiction_array j_1
                LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON jurisdiction_code_header.code_header_title::text = 'jurisdiction_code'::text AND jurisdiction_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code jurisdiction_codes ON jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id AND (j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) = jurisdiction_codes.code_name::text
            ), form_data AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.form_status,
                activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data}'::text[] AS form_data
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.activity_subtype::text = 'Activity_Treatment_ChemicalPlantTerrestrial'::text AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), json_select AS (
            SELECT f.activity_incoming_data_id,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[] AS service_license_company,
                service_license_codes.code_description AS service_license,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_use_permit_PUP}'::text[] AS pesticide_use_permit,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pest_management_plan}'::text[] AS pest_management_plan,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,temperature}'::text[] AS temperature,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,wind_speed}'::text[] AS wind_speed,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,wind_direction_code}'::text[] AS wind_direction,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,humidity}'::text[] AS humidity,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,signage_on_site}'::text[] AS treatment_notice_signs,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,application_start_time}'::text[] AS application_start_time,
                h.invasive_plant,
                COALESCE(h.ip_percent_area_covered, '100'::text) AS ip_percent_area_covered,
                j_1.jurisdiction,
                j_1.percent_covered,
                f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                f.form_data #>> '{chemical_treatment_details,chemical_application_method}'::text[] AS chemical_application_method_code,
                chemical_method_codes.code_description AS chemical_application_method,
                h.herbicide_type,
                h.herbicide,
                h.calculation_type,
                h.amount_of_mix,
                h.delivery_rate_of_mix,
                h.product_application_rate,
                h.dilution,
                h.amount_of_undiluted_herbicide_used_liters,
                h.area_treated_hectares,
                h.area_treated_sqm,
                h.amount_of_mix_used,
                h.percentage_area_covered
              FROM form_data f
                JOIN not_tank_mix_plant_herbicide_join h ON h.activity_incoming_data_id = f.activity_incoming_data_id
                LEFT JOIN jurisdiction_array_select j_1 ON j_1.activity_incoming_data_id = f.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header chemical_method_code_header ON chemical_method_code_header.code_header_title::text = 'chemical_method_code'::text AND chemical_method_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code chemical_method_codes ON chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id AND (f.form_data #>> '{chemical_treatment_details,chemical_application_method}'::text[]) = chemical_method_codes.code_name::text
                LEFT JOIN invasivesbc.code_header service_license_code_header ON service_license_code_header.code_header_title::text = 'service_license_code'::text AND service_license_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code service_license_codes ON service_license_codes.code_header_id = service_license_code_header.code_header_id AND (f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[]) = service_license_codes.code_name::text
              WHERE f.activity_subtype::text = 'Activity_Treatment_ChemicalPlantTerrestrial'::text AND (f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[]) = 'false'::text AND (f.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND f.form_status::text = 'Submitted'::text
            ), tank_mix_json_select AS (
            SELECT f.activity_incoming_data_id,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[] AS service_license_company,
                service_license_codes.code_description AS service_license,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_use_permit_PUP}'::text[] AS pesticide_use_permit,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,pest_management_plan}'::text[] AS pest_management_plan,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,temperature}'::text[] AS temperature,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,wind_speed}'::text[] AS wind_speed,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,wind_direction_code}'::text[] AS wind_direction,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,humidity}'::text[] AS humidity,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,signage_on_site}'::text[] AS treatment_notice_signs,
                f.form_data #>> '{Treatment_ChemicalPlant_Information,application_start_time}'::text[] AS application_start_time,
                tm_1.invasive_plant,
                COALESCE(tm_1.ip_percent_area_covered, '100'::text) AS ip_percent_area_covered,
                j_1.jurisdiction,
                j_1.percent_covered,
                f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[] AS tank_mix,
                f.form_data #>> '{chemical_treatment_details,chemical_application_method}'::text[] AS chemical_application_method_code,
                chemical_method_codes.code_description AS chemical_application_method,
                tm_1.herbicide_type,
                tm_1.herbicide,
                tm_1.calculation_type,
                tm_1.amount_of_mix,
                tm_1.delivery_rate_of_mix,
                tm_1.product_application_rate,
                tm_1.dilution,
                tm_1.amount_of_undiluted_herbicide_used_liters,
                tm_1.area_treated_ha AS area_treated_hectares,
                tm_1.area_treated_sqm,
                tm_1.amount_of_mix_used,
                tm_1.percent_area_covered AS percentage_area_covered
              FROM form_data f
                LEFT JOIN tank_mix_results_select tm_1 ON tm_1.activity_incoming_data_id = f.activity_incoming_data_id
                LEFT JOIN jurisdiction_array_select j_1 ON j_1.activity_incoming_data_id = f.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header chemical_method_code_header ON chemical_method_code_header.code_header_title::text = 'chemical_method_code'::text AND chemical_method_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code chemical_method_codes ON chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id AND (f.form_data #>> '{chemical_treatment_details,chemical_application_method}'::text[]) = chemical_method_codes.code_name::text
                LEFT JOIN invasivesbc.code_header service_license_code_header ON service_license_code_header.code_header_title::text = 'service_license_code'::text AND service_license_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code service_license_codes ON service_license_codes.code_header_id = service_license_code_header.code_header_id AND (f.form_data #>> '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[]) = service_license_codes.code_name::text
              WHERE f.activity_subtype::text = 'Activity_Treatment_ChemicalPlantTerrestrial'::text AND (f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[]) = 'true'::text AND (f.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND f.form_status::text = 'Submitted'::text
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        concat(j.jurisdiction, tm.jurisdiction, ' ', j.percent_covered, tm.percent_covered, '%') AS jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.treatment_person,
        c.well_proximity,
        j.service_license,
        concat(tm.pesticide_use_permit, j.pesticide_use_permit) AS pesticide_use_permit,
        concat(tm.pest_management_plan, j.pest_management_plan) AS pest_management_plan,
        concat(tm.temperature, j.temperature) AS temperature_celsius,
        concat(tm.wind_speed, j.wind_speed) AS wind_speed_km,
        concat(tm.wind_direction, j.wind_direction) AS wind_direction,
        concat(tm.humidity, j.humidity) AS humidity_percent,
        concat(tm.treatment_notice_signs, j.treatment_notice_signs) AS treatment_notice_signs,
        concat(tm.application_start_time, j.application_start_time) AS application_start_time,
        concat(tm.invasive_plant, j.invasive_plant) AS invasive_plant,
        concat(tm.ip_percent_area_covered, j.ip_percent_area_covered, '%') AS invasive_plant_percent,
            CASE
                WHEN concat(tm.tank_mix, j.tank_mix) = 'false'::text THEN 'No'::text
                ELSE 'Yes'::text
            END AS tank_mix,
        concat(tm.chemical_application_method, j.chemical_application_method) AS chemical_application_method,
        concat(tm.herbicide_type, j.herbicide_type) AS herbicide_type,
        concat(tm.herbicide, j.herbicide) AS herbicide,
        concat(tm.calculation_type, j.calculation_type) AS calculation_type,
        concat(tm.delivery_rate_of_mix, j.delivery_rate_of_mix) AS delivery_rate_of_mix,
        concat(tm.product_application_rate, j.product_application_rate) AS product_application_rate,
        concat(tm.dilution, j.dilution) AS dilution,
        concat(tm.percent_covered, j.percent_covered)::double precision / 100::double precision * concat(tm.amount_of_undiluted_herbicide_used_liters, j.amount_of_undiluted_herbicide_used_liters)::double precision AS amount_of_undiluted_herbicide_used_liters,
        concat(tm.percent_covered, j.percent_covered)::double precision / 100::double precision * concat(tm.area_treated_hectares, j.area_treated_hectares)::double precision AS area_treated_hectares,
        concat(tm.percent_covered, j.percent_covered)::double precision / 100::double precision * concat(tm.area_treated_sqm, j.area_treated_sqm)::double precision AS area_treated_sqm,
        concat(tm.percent_covered, j.percent_covered)::double precision / 100::double precision * concat(tm.amount_of_mix_used, j.amount_of_mix)::double precision AS amount_of_mix_used,
        c.elevation,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        LEFT JOIN json_select j ON j.activity_incoming_data_id = c.activity_incoming_data_id
        LEFT JOIN tank_mix_json_select tm ON tm.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.treatment_chemical_terrestrial_plant_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.treatment_chemical_terrestrial_plant_summary TO invasivebc;


    -- invasivesbc.treatment_chemical_terrestrialplant source

    CREATE OR REPLACE VIEW invasivesbc.treatment_chemical_terrestrialplant
    AS SELECT record.activity_id,
        summary.version,
        summary.activity_date_time,
        summary.submitted_time,
        summary.received_timestamp,
        summary.deleted_timestamp,
        summary.biogeoclimatic_zones,
        summary.regional_invasive_species_organization_areas,
        summary.invasive_plant_management_areas,
        summary.ownership,
        summary.regional_districts,
        summary.flnro_districts,
        summary.moti_districts,
        summary.elevation,
        summary.well_proximity,
        summary.utm_zone,
        summary.utm_northing,
        summary.utm_easting,
        summary.albers_northing,
        summary.albers_easting,
        summary.latitude,
        summary.longitude,
        summary.reported_area,
        summary.invasive_species_agency_code,
        summary.general_comment,
        summary.access_description,
        summary.jurisdictions,
        summary.project_code,
        summary.geom,
        summary.geog,
        summary.media_keys,
        record.applicator1_first_name,
        record.applicator1_last_name,
        record.applicator1_licence_number,
        record.applicator2_first_name,
        record.applicator2_last_name,
        record.applicator2_licence_number,
        record.pesticide_employer_code,
        pesticide_employer_codes.code_description AS pesticide_employer,
        record.pesticide_use_permit_pup,
        record.pest_management_plan,
        record.treatment_issues_code,
        treatment_issues_codes.code_description AS treatment_issues,
        record.chemical_method_code,
        chemical_method_codes.code_description AS chemical_method,
        record.temperature,
        record.wind_speed,
        record.wind_direction_code,
        wind_direction_codes.code_description AS wind_direction,
        record.humidity
      FROM invasivesbc.activity_treatment_chemical_terrestrialplant_with_codes record
        JOIN invasivesbc.treatment_summary summary ON summary.activity_id = record.activity_id
        LEFT JOIN invasivesbc.code_header treatment_issues_code_header ON treatment_issues_code_header.code_header_title::text = 'treatment_issues_code'::text AND treatment_issues_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code treatment_issues_codes ON treatment_issues_codes.code_header_id = treatment_issues_code_header.code_header_id AND record.treatment_issues_code = treatment_issues_codes.code_name::text
        LEFT JOIN invasivesbc.code_header pesticide_employer_code_header ON pesticide_employer_code_header.code_header_title::text = 'pesticide_employer_code'::text AND pesticide_employer_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code pesticide_employer_codes ON pesticide_employer_codes.code_header_id = pesticide_employer_code_header.code_header_id AND record.pesticide_employer_code = pesticide_employer_codes.code_name::text
        LEFT JOIN invasivesbc.code_header chemical_method_code_header ON chemical_method_code_header.code_header_title::text = 'chemical_method_code'::text AND chemical_method_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code chemical_method_codes ON chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id AND record.chemical_method_code = chemical_method_codes.code_name::text
        LEFT JOIN invasivesbc.code_header wind_direction_code_header ON wind_direction_code_header.code_header_title::text = 'wind_direction_code'::text AND wind_direction_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code wind_direction_codes ON wind_direction_codes.code_header_id = wind_direction_code_header.code_header_id AND record.wind_direction_code = wind_direction_codes.code_name::text;

    -- Permissions

    ALTER TABLE invasivesbc.treatment_chemical_terrestrialplant OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.treatment_chemical_terrestrialplant TO invasivebc;


    -- invasivesbc.treatment_mechanical_aquatic_plant_summary source

    CREATE OR REPLACE VIEW invasivesbc.treatment_mechanical_aquatic_plant_summary
    AS WITH mechanical_treatment_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.form_status,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,Treatment_MechanicalPlant_Information}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), shoreline_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                activity_incoming_data.form_status,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,ShorelineTypes}'::text[]) AS shorelines
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND activity_incoming_data.form_status::text = 'Submitted'::text
            ), mechanical_treatment_select AS (
            SELECT m_1.activity_incoming_data_id,
                a_1.activity_payload #>> '{form_data,activity_subtype_data,Authorization_Infotmation,additional_auth_information}'::text[] AS authorization_information,
                m_1.json_array #>> '{treated_area}'::text[] AS treated_area,
                m_1.json_array #>> '{disposed_material,disposed_material_input_format}'::text[] AS disposed_material_format,
                m_1.json_array #>> '{disposed_material,disposed_material_input_number}'::text[] AS disposed_material_amount,
                m_1.json_array #>> '{invasive_plant_code}'::text[] AS invasive_plant_code,
                invasive_plant_aquatic_codes.code_description AS invasive_plant,
                m_1.json_array #>> '{mechanical_method_code}'::text[] AS mechanical_method_code,
                mechanical_method_codes.code_description AS mechanical_method,
                m_1.json_array #>> '{mechanical_disposal_code}'::text[] AS mechanical_disposal_code,
                mechanical_disposal_codes.code_description AS disposal_method
              FROM mechanical_treatment_array m_1
                JOIN invasivesbc.activity_incoming_data a_1 ON a_1.activity_incoming_data_id = m_1.activity_incoming_data_id
                LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON invasive_plant_aquatic_code_header.code_header_title::text = 'invasive_plant_aquatic_code'::text AND invasive_plant_aquatic_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id AND (m_1.json_array #>> '{invasive_plant_code}'::text[]) = invasive_plant_aquatic_codes.code_name::text
                LEFT JOIN invasivesbc.code_header mechanical_method_code_header ON mechanical_method_code_header.code_header_title::text = 'mechanical_method_code'::text AND mechanical_method_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code mechanical_method_codes ON mechanical_method_codes.code_header_id = mechanical_method_code_header.code_header_id AND (m_1.json_array #>> '{mechanical_method_code}'::text[]) = mechanical_method_codes.code_name::text
                LEFT JOIN invasivesbc.code_header mechanical_disposal_code_header ON mechanical_disposal_code_header.code_header_title::text = 'mechanical_disposal_code'::text AND mechanical_disposal_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code mechanical_disposal_codes ON mechanical_disposal_codes.code_header_id = mechanical_disposal_code_header.code_header_id AND (m_1.json_array #>> '{mechanical_disposal_code}'::text[]) = mechanical_disposal_codes.code_name::text
              WHERE m_1.activity_subtype::text = 'Activity_Treatment_MechanicalPlantAquatic'::text
            ), shoreline_array_select AS (
            SELECT a_1.activity_incoming_data_id,
                a_1.shorelines #>> '{shoreline_type}'::text[] AS shoreline_type,
                shoreline_type_codes.code_description AS shoreline_description,
                a_1.shorelines #>> '{percent_covered}'::text[] AS percent_covered
              FROM shoreline_array a_1
                LEFT JOIN invasivesbc.code_header shoreline_type_code_header ON shoreline_type_code_header.code_header_title::text = 'shoreline_type_code'::text AND shoreline_type_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code shoreline_type_codes ON shoreline_type_codes.code_header_id = shoreline_type_code_header.code_header_id AND (a_1.shorelines #>> '{shoreline_type}'::text[]) = shoreline_type_codes.code_name::text
            ), shoreline_agg AS (
            SELECT string_agg(((a_1.shoreline_description::text || ' '::text) || a_1.percent_covered) || '%'::text, ', '::text ORDER BY a_1.shoreline_description) AS shorelines,
                a_1.activity_incoming_data_id
              FROM shoreline_array_select a_1
              GROUP BY a_1.activity_incoming_data_id
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        c.jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.observation_person,
        m.authorization_information,
        a.shorelines,
        m.treated_area,
        m.disposed_material_format,
        m.disposed_material_amount,
        m.invasive_plant,
        m.mechanical_method,
        m.disposal_method,
        c.elevation,
        c.well_proximity,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        JOIN mechanical_treatment_select m ON m.activity_incoming_data_id = c.activity_incoming_data_id
        JOIN shoreline_agg a ON a.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Treatment_MechanicalPlantAquatic'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.treatment_mechanical_aquatic_plant_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.treatment_mechanical_aquatic_plant_summary TO invasivebc;


    -- invasivesbc.treatment_mechanical_terrestrial_plant_summary source

    CREATE OR REPLACE VIEW invasivesbc.treatment_mechanical_terrestrial_plant_summary
    AS WITH mechanical_treatment_array AS (
            SELECT activity_incoming_data.activity_incoming_data_id,
                activity_incoming_data.activity_subtype,
                jsonb_array_elements(activity_incoming_data.activity_payload #> '{form_data,activity_subtype_data,Treatment_MechanicalPlant_Information}'::text[]) AS json_array
              FROM invasivesbc.activity_incoming_data
              WHERE (activity_incoming_data.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current))
            ), mechanical_treatment_select AS (
            SELECT m_1.activity_incoming_data_id,
                m_1.json_array #>> '{treated_area}'::text[] AS treated_area,
                m_1.json_array #>> '{disposed_material,disposed_material_input_format}'::text[] AS disposed_material_format,
                m_1.json_array #>> '{disposed_material,disposed_material_input_number}'::text[] AS disposed_material_amount,
                m_1.json_array #>> '{invasive_plant_code}'::text[] AS invasive_plant_code,
                invasive_plant_codes.code_description AS invasive_plant,
                m_1.json_array #>> '{mechanical_method_code}'::text[] AS mechanical_method_code,
                mechanical_method_codes.code_description AS mechanical_method,
                m_1.json_array #>> '{mechanical_disposal_code}'::text[] AS mechanical_disposal_code,
                mechanical_disposal_codes.code_description AS disposal_method
              FROM mechanical_treatment_array m_1
                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND (m_1.json_array #>> '{invasive_plant_code}'::text[]) = invasive_plant_codes.code_name::text
                LEFT JOIN invasivesbc.code_header mechanical_method_code_header ON mechanical_method_code_header.code_header_title::text = 'mechanical_method_code'::text AND mechanical_method_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code mechanical_method_codes ON mechanical_method_codes.code_header_id = mechanical_method_code_header.code_header_id AND (m_1.json_array #>> '{mechanical_method_code}'::text[]) = mechanical_method_codes.code_name::text
                LEFT JOIN invasivesbc.code_header mechanical_disposal_code_header ON mechanical_disposal_code_header.code_header_title::text = 'mechanical_disposal_code'::text AND mechanical_disposal_code_header.valid_to IS NULL
                LEFT JOIN invasivesbc.code mechanical_disposal_codes ON mechanical_disposal_codes.code_header_id = mechanical_disposal_code_header.code_header_id AND (m_1.json_array #>> '{mechanical_disposal_code}'::text[]) = mechanical_disposal_codes.code_name::text
              WHERE (m_1.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
                      FROM invasivesbc.activity_current)) AND m_1.activity_subtype::text = 'Activity_Treatment_MechanicalPlantTerrestrial'::text
            )
    SELECT c.activity_incoming_data_id,
        c.activity_id,
        c.short_id,
        c.project_code,
        c.activity_date_time,
        c.reported_area_sqm,
        c.latitude,
        c.longitude,
        c.utm_zone,
        c.utm_easting,
        c.utm_northing,
        c.employer_description AS employer,
        c.funding_agency,
        c.jurisdiction,
        c.access_description,
        c.location_description,
        c.comment,
        c.observation_person,
        m.invasive_plant,
        m.treated_area,
        m.mechanical_method,
        m.disposal_method,
        m.disposed_material_format,
        m.disposed_material_amount,
        c.elevation,
        c.well_proximity,
        c.biogeoclimatic_zones,
        c.regional_invasive_species_organization_areas,
        c.invasive_plant_management_areas,
        c.ownership,
        c.regional_districts,
        c.flnro_districts,
        c.moti_districts,
        c.photo,
        c.created_timestamp,
        c.received_timestamp,
        c.geom,
        c.geog
      FROM invasivesbc.common_summary c
        FULL JOIN mechanical_treatment_select m ON m.activity_incoming_data_id = c.activity_incoming_data_id
      WHERE c.activity_subtype = 'Activity_Treatment_MechanicalPlantTerrestrial'::text AND (c.activity_incoming_data_id IN ( SELECT activity_current.incoming_data_id
              FROM invasivesbc.activity_current)) AND c.form_status::text = 'Submitted'::text;

    -- Permissions

    ALTER TABLE invasivesbc.treatment_mechanical_terrestrial_plant_summary OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.treatment_mechanical_terrestrial_plant_summary TO invasivebc;


    -- invasivesbc.treatment_mechanical_terrestrialplant source

    CREATE OR REPLACE VIEW invasivesbc.treatment_mechanical_terrestrialplant
    AS SELECT record.activity_id,
        summary.version,
        summary.activity_date_time,
        summary.submitted_time,
        summary.received_timestamp,
        summary.deleted_timestamp,
        summary.biogeoclimatic_zones,
        summary.regional_invasive_species_organization_areas,
        summary.invasive_plant_management_areas,
        summary.ownership,
        summary.regional_districts,
        summary.flnro_districts,
        summary.moti_districts,
        summary.elevation,
        summary.well_proximity,
        summary.utm_zone,
        summary.utm_northing,
        summary.utm_easting,
        summary.albers_northing,
        summary.albers_easting,
        summary.latitude,
        summary.longitude,
        summary.reported_area,
        summary.invasive_species_agency_code,
        summary.general_comment,
        summary.access_description,
        summary.jurisdictions,
        summary.project_code,
        summary.geom,
        summary.geog,
        summary.media_keys,
        record.invasive_plant_code,
        invasive_plant_codes.code_description AS invasive_plant,
        record.mechanical_method_code,
        mechanical_method_codes.code_description AS mechanical_method,
        record.mechanical_disposal_code,
        mechanical_disposal_codes.code_description AS mechanical_disposal,
        record.root_removal_code,
        root_removal_codes.code_description AS root_removal,
        record.soil_disturbance_code,
        soil_disturbance_codes.code_description AS soil_disturbance,
        record.signage_on_site
      FROM invasivesbc.activity_treatment_mechanical_terrestrialplant_with_codes record
        JOIN invasivesbc.treatment_summary summary ON summary.activity_id = record.activity_id
        LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON invasive_plant_code_header.code_header_title::text = 'invasive_plant_code'::text AND invasive_plant_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code invasive_plant_codes ON invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id AND record.invasive_plant_code = invasive_plant_codes.code_name::text
        LEFT JOIN invasivesbc.code_header mechanical_method_code_header ON mechanical_method_code_header.code_header_title::text = 'mechanical_method_code'::text AND mechanical_method_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code mechanical_method_codes ON mechanical_method_codes.code_header_id = mechanical_method_code_header.code_header_id AND record.mechanical_method_code = mechanical_method_codes.code_name::text
        LEFT JOIN invasivesbc.code_header mechanical_disposal_code_header ON mechanical_disposal_code_header.code_header_title::text = 'mechanical_disposal_code'::text AND mechanical_disposal_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code mechanical_disposal_codes ON mechanical_disposal_codes.code_header_id = mechanical_disposal_code_header.code_header_id AND record.mechanical_disposal_code = mechanical_disposal_codes.code_name::text
        LEFT JOIN invasivesbc.code_header root_removal_code_header ON root_removal_code_header.code_header_title::text = 'root_removal_code'::text AND root_removal_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code root_removal_codes ON root_removal_codes.code_header_id = root_removal_code_header.code_header_id AND record.root_removal_code = root_removal_codes.code_name::text
        LEFT JOIN invasivesbc.code_header soil_disturbance_code_header ON soil_disturbance_code_header.code_header_title::text = 'soil_disturbance_code'::text AND soil_disturbance_code_header.valid_to IS NULL
        LEFT JOIN invasivesbc.code soil_disturbance_codes ON soil_disturbance_codes.code_header_id = soil_disturbance_code_header.code_header_id AND record.soil_disturbance_code = soil_disturbance_codes.code_name::text;

    -- Permissions

    ALTER TABLE invasivesbc.treatment_mechanical_terrestrialplant OWNER TO invasivebc;
    GRANT ALL ON TABLE invasivesbc.treatment_mechanical_terrestrialplant TO invasivebc;

    CREATE OR REPLACE FUNCTION invasivesbc.delete_last_activity()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
          BEGIN
              update invasivesbc.activity_incoming_data
              set deleted_timestamp = NOW()
              where activity_id = new.activity_id
              and deleted_timestamp is null;
              RETURN NEW;
          END;
          $function$
    ;

    -- Permissions

    ALTER FUNCTION invasivesbc.delete_last_activity() OWNER TO invasivebc;
    GRANT ALL ON FUNCTION invasivesbc.delete_last_activity() TO invasivebc;

    CREATE OR REPLACE FUNCTION invasivesbc.immutable_to_date(the_date text)
    RETURNS date
    LANGUAGE sql
    IMMUTABLE
    AS $function$
      select to_date(the_date, 'yyyy-mm-dd');
      $function$
    ;

    -- Permissions

    ALTER FUNCTION invasivesbc.immutable_to_date(text) OWNER TO invasivebc;
    GRANT ALL ON FUNCTION invasivesbc.immutable_to_date(text) TO invasivebc;

    CREATE OR REPLACE FUNCTION invasivesbc.update_created_by_on_activity_updates_function()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
          BEGIN
              UPDATE invasivesbc.activity_incoming_data
              SET created_by = (
                SELECT created_by
                FROM invasivesbc.activity_incoming_data
                WHERE NEW.activity_id = activity_id
                AND created_by IS NOT null
                ORDER BY created_timestamp ASC
                LIMIT 1
              )
              WHERE activity_id = new.activity_id
              AND NEW.created_by is null;
              RETURN new;
          END
          $function$
    ;

    -- Permissions

    ALTER FUNCTION invasivesbc.update_created_by_on_activity_updates_function() OWNER TO invasivebc;
    GRANT ALL ON FUNCTION invasivesbc.update_created_by_on_activity_updates_function() TO invasivebc;

    -- Table Triggers

    create trigger update_created_by_on_activity_updates after
    insert
        on
        invasivesbc.activity_incoming_data for each row execute procedure invasivesbc.update_created_by_on_activity_updates_function();


    -- Permissions

    GRANT ALL ON SCHEMA invasivesbc TO invasivebc;
    `);
  } catch (e) {
    console.log('Failed to build SQL', e);
  }
}

export async function down(knex: Knex) {
  await knex.raw(`
  `);
}
