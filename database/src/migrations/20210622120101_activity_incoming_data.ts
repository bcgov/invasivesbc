import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -- ### Adding offline sync controls for ${DB_SCHEMA}.activity_incoming_data ### --

    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data
    ADD COLUMN created_by VARCHAR(100);
    
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.created_by IS 'Identifier of the author of an activity';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data
    ADD COLUMN form_status VARCHAR(100) DEFAULT 'Not Validated';
    
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.form_status IS 'Validation status of the activity form';
    
    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data
    ADD COLUMN sync_status VARCHAR(100) DEFAULT 'Save Successful';
    
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.sync_status IS 'Sync/Save status of the activity form';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data
    ADD COLUMN review_status VARCHAR(100) DEFAULT 'Not Reviewed';
    
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.review_status IS 'Indicator of whether the activity is up for review by administrators';

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data
    ADD COLUMN reviewed_by VARCHAR(100);
    
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.reviewed_by IS 'Identifier of the latest reviewer approving an activity for wide usage';
  
    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data
    ADD COLUMN reviewed_at timestamp without time zone;
    
    COMMENT ON COLUMN ${DB_SCHEMA}.activity_incoming_data.reviewed_at IS 'Timestamp of when the activity was last reviewed';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data DROP COLUMN created_by;
    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data DROP COLUMN form_status;
    ALTER TABLE ${DB_SCHEMA}.activity_incoming_data DROP COLUMN sync_status; 
  `);
}
