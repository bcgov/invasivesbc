import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    -- ### Creating Table: ${DB_SCHEMA}.activity_incoming_data ### --

    CREATE SCHEMA IF NOT EXISTS ${DB_SCHEMA};

    CREATE TABLE ${DB_SCHEMA}.activity_incoming_data ();
    COMMENT ON TABLE ${DB_SCHEMA}.activity_incoming_data IS 'Store all incoming data if valid. All mandatory columns must be preset (type & geometry). This is a staging area for further propagation and acts as a source of truth for all field data.';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN activity_incoming_data_id SERIAL PRIMARY KEY;
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.activity_incoming_data_id IS 'Auto generated primary key';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN activity_id UUID;
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.activity_id IS 'Unique record number. Can occur multiple times with record updates.';
    CREATE INDEX activity_incoming_data_activity_id_idx on ${DB_SCHEMA}.activity_incoming_data (activity_id);

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN version INTEGER NULL;
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.version IS 'Indicative of the version for each unique record. Calculated server side.';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN activity_type VARCHAR(200) NULL;
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.activity_type IS 'Type of record';
    CREATE INDEX activity_incoming_data_activity_type_idx on ${DB_SCHEMA}.activity_incoming_data (activity_type);

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN activity_subtype VARCHAR(200) NULL;
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.activity_subtype IS 'Sub Type of record';
    CREATE INDEX activity_incoming_data_activity_subtype_idx on ${DB_SCHEMA}.activity_incoming_data (activity_subtype);

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN created_timestamp timestamp NOT NULL DEFAULT NOW();
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.created_timestamp IS 'The date and time data was created on the users device.';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN received_timestamp timestamp NOT NULL DEFAULT NOW();
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.received_timestamp IS 'The date and time data was received and inserted into the database.';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN deleted_timestamp timestamp DEFAULT NULL;
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.deleted_timestamp IS 'The date and time the record was marked as deleted. Also used to indicate old versions. Calculated server side.';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN geom geometry(Geometry,3005) CHECK (st_isValid(geom));
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.geom IS 'Geometry in Albers projection.';
    CREATE INDEX activity_incoming_data_geom_idx on ${DB_SCHEMA}.activity_incoming_data using gist ("geom");

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN geog geography(Geometry);
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.geog IS 'Geography type containing a geometry.';
    CREATE INDEX activity_incoming_data_geog_idx on ${DB_SCHEMA}.activity_incoming_data using gist ("geog");

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN media_keys text[];
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.media_keys IS 'Array of keys used to fetch original files from external storage';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN activity_payload JSONB;
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.activity_payload IS 'Raw data upload in compressed JSON format.';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN biogeoclimatic_zones varchar(30);
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.biogeoclimatic_zones  IS 'Biogeoclimatic Ecosystem Classification (BEC) Zone/Subzone/Variant/Phase';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN regional_invasive_species_organization_areas varchar(10);
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.regional_invasive_species_organization_areas IS 'Regional Invasive Species Organizations (RISO) are non-profit societies in BC that provide invasive species education and management under the collective Invasive Species Council of BC.';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN invasive_plant_management_areas varchar(50);
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.invasive_plant_management_areas IS 'Regional Invasive Species Organizations (RISO) are non-profit societies in BC that provide invasive species education and management under the collective Invasive Species Council of BC. Within several RISO areas, they subdivide the land area in smaller management areas (Invasive Plant Management Areas).';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN forest_cover_ownership varchar(100);
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.forest_cover_ownership IS 'This data product is a generalized description of the primary ownership of forest lands for use in strategic decision making such as Timber Supply Analysis. It is based upon the structure used in the Forest Inventory Planning (FIP/FC1) format. It is created and revised using information from Min of Agriculture and Lands Registries Branch.';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN regional_districts varchar(100);
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.regional_districts IS 'Regional districts of British Columbia: https://catalogue.data.gov.bc.ca/dataset/d1aff64e-dbfe-45a6-af97-582b7f6418b9';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN flnro_districts varchar(100);
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.flnro_districts IS 'Ministry of Forest Lands and Natural Resources districts';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data ADD COLUMN moti_districts varchar(100);
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.moti_districts IS 'Ministry of Transportation and Infrastructure districts';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    DROP TABLE IF EXISTS ${DB_SCHEMA}.activity_incoming_data;
  `);
}
