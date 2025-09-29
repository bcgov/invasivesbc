import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS invasivesbc.pmtiles_manifest (
      scale TEXT NOT NULL,
      sheet_id TEXT NOT NULL,
      url TEXT NOT NULL,
      minzoom INT NOT NULL,
      maxzoom INT NOT NULL,
      bytes BIGINT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (scale, sheet_id)
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE IF EXISTS invasivesbc.pmtiles_manifest;
  `);
}
