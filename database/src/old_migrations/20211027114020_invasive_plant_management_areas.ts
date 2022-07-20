import * as Knex from 'knex';

const DB_SCHEMA = 'public';

export async function up(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      drop table if exists invasive_plant_management_areas;

      CREATE TABLE if not exists "invasive_plant_management_areas" (gid serial,
        "ogc_fid" int4,
        "objectid" int4,
        "ipma" varchar(50),
        "agency_cd" varchar(8),
        "dropdown_n" varchar(60),
        "agency" varchar(60));

      ALTER TABLE "invasive_plant_management_areas" ADD PRIMARY KEY (gid);
      SELECT AddGeometryColumn('','invasive_plant_management_areas','geom','4326','MULTIPOLYGON',2);
      CREATE INDEX ON "invasive_plant_management_areas" USING GIST ("geom");
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error loading IPMAs', e);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      drop table if exists invasive_plant_management_areas;
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error deleting IPMAs', e);
  }
}
