import * as Knex from 'knex';

const DB_SCHEMA = 'public';

export async function up(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set search_path = ${DB_SCHEMA},public;
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      CREATE TABLE "pest_management_plan_areas" (
	      "ogc_fid" SERIAL,
        CONSTRAINT "pest_management_plan_areas_pk" PRIMARY KEY ("ogc_fid")
      );
      SELECT AddGeometryColumn('public','pest_management_plan_areas','wkb_geometry',3005,'MULTIPOLYGON',2);
      CREATE INDEX "pest_management_plan_areas_wkb_geometry_geom_idx" ON "pest_management_plan_areas" USING GIST ("wkb_geometry");
      ALTER TABLE "pest_management_plan_areas" ADD COLUMN "pmp_name" VARCHAR(254);
      ALTER TABLE "pest_management_plan_areas" ADD COLUMN "contributi" VARCHAR(254);
      ALTER TABLE "pest_management_plan_areas" ADD COLUMN "label" VARCHAR(254);


    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error loading PMPs', e);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set search_path = ${DB_SCHEMA},public;
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      drop table if exists pest_management_plan_areas;
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error deleting PMPs', e);
  }
}
