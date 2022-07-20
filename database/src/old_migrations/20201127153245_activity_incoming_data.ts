import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -- ### Increasing column lengths for ${DB_SCHEMA}.activity_incoming_data ### --

    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data alter COLUMN regional_invasive_species_organization_areas type varchar(100);
    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data alter COLUMN invasive_plant_management_areas type varchar(100);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data alter COLUMN regional_invasive_species_organization_areas type varchar(10);
    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data alter COLUMN invasive_plant_management_areas type varchar(50);
  `);
}
