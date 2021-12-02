import * as Knex from 'knex';

const DB_SCHEMA = 'public';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      drop table if exists aggregate;

      CREATE TABLE if not exists "aggregate" (gid serial,
        "pit_number" varchar(254),
        "pit_name" varchar(254),
        "layer" varchar(100),
        "path" varchar(200));
      ALTER TABLE "aggregate" ADD PRIMARY KEY (gid);
      SELECT AddGeometryColumn('','aggregate','geom','4326','MULTIPOLYGON',2);

      CREATE INDEX ON "aggregate" USING GIST ("geom");
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error loading aggregate', e);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      drop table if exists aggregate;
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error deleting aggregate', e);
  }
}
