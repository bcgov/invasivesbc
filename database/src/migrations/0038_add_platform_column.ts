import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.raw(`
      ALTER TABLE invasivesbc.activity_incoming_data
      ADD COLUMN platform_src TEXT;
  `);
    await knex.raw(`
      COMMENT ON COLUMN invasivesbc.activity_incoming_data.platform_src IS 'Indicates whether the record was created via web or mobile';
  `);
  } catch (e) {
    console.error('Failed to add platform_src column:', e);
    throw e;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.raw(`
      ALTER TABLE invasivesbc.activity_incoming_data
      DROP COLUMN platform_src;
    `);
  } catch (e) {
    console.error('Failed to rollback invasivesbc.activity_incoming_data table:', e);
    throw e;
  }
}
