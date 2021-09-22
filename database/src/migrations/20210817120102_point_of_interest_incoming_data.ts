import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -- ### Adding offline sync controls for ${DB_SCHEMA}.point_of_interest_incoming_data ### --

    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.point_of_interest_incoming_data
    ADD COLUMN species_positive VARCHAR[] DEFAULT '{}' NOT NULL,
    ADD COLUMN species_negative VARCHAR[] DEFAULT '{}' NOT NULL;
    
    COMMENT ON COLUMN ${DB_SCHEMA}.point_of_interest_incoming_data.species_positive IS 'List of species associated with the record';
    COMMENT ON COLUMN ${DB_SCHEMA}.point_of_interest_incoming_data.species_negative IS 'List of species negatively associated with the record. (Designated negative occurrences)';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.point_of_interest_incoming_data DROP COLUMN species_positive;
    ALTER TABLE ${DB_SCHEMA}.point_of_interest_incoming_data DROP COLUMN species_negative;
  `);
}
