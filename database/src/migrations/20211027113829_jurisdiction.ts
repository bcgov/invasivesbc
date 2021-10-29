import * as Knex from 'knex';

const DB_SCHEMA = 'public';

export async function up(knex: Knex): Promise<void> {
  try {
    const sql = `
      set search_path = ${DB_SCHEMA},public;
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      CREATE TABLE "jurisdiction" (
        "gid" serial,
        "type" varchar(30),
        "name" varchar(74),
        "jurisdictn" varchar(75),
        "draworder" int4,
        "code_name" varchar(10));
      ALTER TABLE "jurisdiction" ADD PRIMARY KEY (gid);
      SELECT AddGeometryColumn('','jurisdiction','geom','4326','MULTIPOLYGON',2);

      CREATE INDEX ON "jurisdiction" USING GIST ("geom");
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error loading jurisdictions', e);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const sql = `
      set search_path = ${DB_SCHEMA},public;
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      drop table if exists jurisdiction;
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error deleting jurisdictions', e);
  }
}
