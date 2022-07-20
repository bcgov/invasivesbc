import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  try {
    const sql = `
    set client_encoding to utf8;
    set standard_conforming_strings to on;
    
    -- public.regional_invasive_species_organization_areas source
    
    DROP TABLE if exists regional_invasive_species_organization_areas;

    CREATE TABLE if not exists "public"."regional_invasive_species_organization_areas" (gid serial,
      "ogc_fid" int4,
      "objectid" int4,
      "agency_cd" varchar(8),
      "dropdown_n" varchar(60),
      "layer" varchar(100),
      "agency" varchar(52));
    ALTER TABLE "public"."regional_invasive_species_organization_areas" ADD PRIMARY KEY (gid);
    SELECT AddGeometryColumn('','regional_invasive_species_organization_areas','geom','4326','MULTIPOLYGON',4);

    CREATE INDEX ON "public"."regional_invasive_species_organization_areas" USING GIST ("geom");

    -- public.invasive_plant_management_areas source

    DROP TABLE if exists invasive_plant_management_areas;

    CREATE TABLE if not exists "public"."invasive_plant_management_areas" (gid serial,
      "ogc_fid" int4,
      "objectid" int4,
      "ipma" varchar(50),
      "agency_cd" varchar(8),
      "dropdown_n" varchar(60),
      "agency" varchar(60));

    ALTER TABLE "public"."invasive_plant_management_areas" ADD PRIMARY KEY (gid);
    SELECT AddGeometryColumn('','invasive_plant_management_areas','geom','4326','MULTIPOLYGON',2);
    CREATE INDEX ON "public"."invasive_plant_management_areas" USING GIST ("geom");

    -- public.aggregate source
    
    DROP TABLE if exists aggregate;

    CREATE TABLE if not exists "public"."aggregate" (gid serial,
      "pit_number" varchar(254),
      "pit_name" varchar(254),
      "layer" varchar(100),
      "path" varchar(200));
    ALTER TABLE "public"."aggregate" ADD PRIMARY KEY (gid);
    SELECT AddGeometryColumn('','aggregate','geom','4326','MULTIPOLYGON',2);

    CREATE INDEX ON "public"."aggregate" USING GIST ("geom");

    -- public.jurisdiction source
    
    DROP TABLE if exists "jurisdiction";

    CREATE TABLE if not exists "public"."jurisdiction" (
      "gid" serial,
      "type" varchar(30),
      "name" varchar(74),
      "jurisdictn" varchar(75),
      "draworder" int4,
      "code_name" varchar(10));
    ALTER TABLE "public"."jurisdiction" ADD PRIMARY KEY (gid);
    SELECT AddGeometryColumn('','jurisdiction','geom','4326','MULTIPOLYGON',2);

    CREATE INDEX ON "public"."jurisdiction" USING GIST ("geom");

    CREATE OR REPLACE FUNCTION public.ST_Intersects2(geom1 geometry, geom2 geometry)
    RETURNS boolean
    AS 'SELECT $1 && $2 AND _ST_Intersects($1,$2)'
    LANGUAGE 'sql' IMMUTABLE;

    -- public.pest_management_plan_areas source

    DROP TABLE if exists public.pest_management_plan_areas;

    CREATE TABLE "public"."pest_management_plan_areas" (
      "ogc_fid" SERIAL,
      "geog" geography(POLYGON,4326),
      CONSTRAINT "pest_management_plan_areas_pk" PRIMARY KEY ("ogc_fid"));
    CREATE INDEX "pest_management_plan_areas_geog_geom_idx" ON "public"."pest_management_plan_areas" using gist ("geog");
    ALTER TABLE "public"."pest_management_plan_areas" add column "pmp_name" varchar(254);

    -- public.regional_districts source

    DROP TABLE if exists regional_districts;

    CREATE TABLE "public"."regional_districts" (gid serial,
      "agency" varchar(200),
      "agency_cd" varchar(40),
      "dropdown_n" varchar(240),
      "geog" geography(MULTIPOLYGON,4326));

    ALTER TABLE "public"."regional_districts" ADD PRIMARY KEY (gid);

    CREATE INDEX "regional_districts_geog_geom_idx" ON "public"."regional_districts" USING GIST ("geog");

      `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error rolling back migration of context tables', e);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const sql = ``;
    await knex.raw(sql);
  } catch (e) {
    console.log('failed to build sql', e);
  }
}
