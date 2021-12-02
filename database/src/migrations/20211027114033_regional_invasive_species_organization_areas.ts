import * as Knex from 'knex';

const DB_SCHEMA = 'public';

export async function up(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;
      drop table if exists regional_invasive_species_organization_areas;
      CREATE TABLE if not exists "regional_invasive_species_organization_areas" (gid serial,
        "ogc_fid" int4,
        "objectid" int4,
        "agency_cd" varchar(8),
        "dropdown_n" varchar(60),
        "layer" varchar(100),
        "agency" varchar(52));
      ALTER TABLE "regional_invasive_species_organization_areas" ADD PRIMARY KEY (gid);
      SELECT AddGeometryColumn('','regional_invasive_species_organization_areas','geom','4326','MULTIPOLYGON',4);

      CREATE INDEX ON "regional_invasive_species_organization_areas" USING GIST ("geom");
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error loading RISOs', e);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      drop table if exists regional_invasive_species_organization_areas;
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error deleting RISOs', e);
  }
}
