import * as Knex from 'knex';

const DB_SCHEMA = 'public';

export async function up(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set search_path = ${DB_SCHEMA},public;
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      drop table if exists pest_management_plan_areas;

      create table "public"."pest_management_plan_areas" ( "ogc_fid" SERIAL, "geog" geography(POLYGON,4326), CONSTRAINT "pest_management_plan_areas_pk" PRIMARY KEY ("ogc_fid") );
      create index "pest_management_plan_areas_geog_geom_idx" ON "public"."pest_management_plan_areas" using gist ("geog");
      alter table "public"."pest_management_plan_areas" add column "pmp_name" varchar(254);

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
