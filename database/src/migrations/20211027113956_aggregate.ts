import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set search_path = ${DB_SCHEMA},public;
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      CREATE TABLE "aggregate" (gid serial,
        "pit_number" varchar(254),
        "pit_name" varchar(254),
        "layer" varchar(100),
        "path" varchar(200));
      ALTER TABLE "aggregate" ADD PRIMARY KEY (gid);
      SELECT AddGeometryColumn('','aggregate','geom','4326','MULTIPOLYGON',2);

      CREATE INDEX ON "aggregate" USING GIST ("geom");
    `;
  } catch (e) {
    console.error('Error loading aggregate', e);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set search_path = ${DB_SCHEMA},public;
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      drop table aggregate;
    `;
  } catch (e) {
    console.error('Error loading jurisdictions', e);
  }
}
