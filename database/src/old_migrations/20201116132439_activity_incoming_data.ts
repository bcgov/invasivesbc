import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

/**
 * Add an new columns for contextual data to the activity_incoming_data table.
 * Also rename the 'forest_cover_ownership' column to just 'ownership'.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    alter table activity_incoming_data
    rename column forest_cover_ownership to ownership;

    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.ownership IS 'The information is sourced from the Crown Land Registry which is the primary government record of lands transferred out of Crown Provincial ownership (as defined under the Land Act).';


    alter table ${DB_SCHEMA}.activity_incoming_data
    add column elevation integer;

    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.elevation IS 'Metres above sea level. Abstracted from the Federal Government API for the Canadian Digital Elevation Model (CDEM).';


    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.elevation IS 'Corporate provincial digital Biogeoclimatic Ecosystem Classification (BEC) Zone/Subzone/Variant/Phase map';


    alter table ${DB_SCHEMA}.activity_incoming_data
    add column well_proximity integer;

    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.well_proximity IS 'Distance to the closest well in metres.';


    alter table ${DB_SCHEMA}.activity_incoming_data
    add column utm_zone integer;

    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.utm_zone IS 'Northern hemisphere UTM zone number.';


    alter table ${DB_SCHEMA}.activity_incoming_data
    add column utm_northing real;

    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.utm_northing IS 'Northern hemisphere UTM Y coordinate in metres.';


    alter table ${DB_SCHEMA}.activity_incoming_data
    add column utm_easting real;

    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.utm_easting IS 'Northern hemisphere UTM X coordinate in metres.';


    alter table ${DB_SCHEMA}.activity_incoming_data
    add column albers_northing real;

    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.albers_northing IS 'Albers Y coordinate in metres.';


    alter table ${DB_SCHEMA}.activity_incoming_data
    add column albers_easting real;

    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.albers_easting IS 'Albers X coordinate in metres.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    alter table ${DB_SCHEMA}.activity_incoming_data
    rename column ownership to forest_cover_ownership;

    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.forest_cover_ownership IS 'This data product is a generalized description of the primary ownership of forest lands for use in strategic decision making such as Timber Supply Analysis. It is based upon the structure used in the Forest Inventory Planning (FIP/FC1) format. It is created and revised using information from Min of Agriculture and Lands Registries Branch.';

    alter table ${DB_SCHEMA}.activity_incoming_data drop column elevation;

    alter table ${DB_SCHEMA}.activity_incoming_data drop column well_proximity;

    alter table ${DB_SCHEMA}.activity_incoming_data drop column utm_zone;

    alter table ${DB_SCHEMA}.activity_incoming_data drop column utm_northing;

    alter table ${DB_SCHEMA}.activity_incoming_data drop column utm_easting;

    alter table ${DB_SCHEMA}.activity_incoming_data drop column albers_northing;

    alter table ${DB_SCHEMA}.activity_incoming_data drop column albers_easting;

  `);
}
