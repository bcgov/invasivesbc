import * as Knex from "knex";

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

/**
 * Add an elevation column to the activity_incoming_data table.
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

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.ownership IS 'The information is sourced from the Crown Land Registry which is the primary government record of lands transferred out of Crown Provincial ownership (as defined under the Land Act).';


    alter table activity_incoming_data
    add column elevation integer;

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.elevation IS 'Metres above sea level. Abstracted from the Federal Government API for the Canadian Digital Elevation Model (CDEM).';


    alter table activity_incoming_data
    add column biogeoclimatic_zones varchar(30);

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.elevation IS 'Corporate provincial digital Biogeoclimatic Ecosystem Classification (BEC) Zone/Subzone/Variant/Phase map';
  `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    alter table activity_incoming_data
    rename column ownership to forest_cover_ownership;

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.forest_cover_ownership IS 'This data product is a generalized description of the primary ownership of forest lands for use in strategic decision making such as Timber Supply Analysis. It is based upon the structure used in the Forest Inventory Planning (FIP/FC1) format. It is created and revised using information from Min of Agriculture and Lands Registries Branch.';

    alter table activity_incoming_data
    drop column elevation;

  `);
}

