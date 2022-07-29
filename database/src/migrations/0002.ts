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

    -- public.utm_zones source

    SET lock_timeout = 0;
    SET idle_in_transaction_session_timeout = 0;
    SET client_encoding = 'UTF8';
    SET standard_conforming_strings = on;
    SET check_function_bodies = false;
    SET client_min_messages = warning;
    SET row_security = off;


    SET default_with_oids = false;

    drop table if exists public.utm_zones;

    CREATE TABLE public.utm_zones (
        objectid integer NOT NULL,
        utm_zone smallint NOT NULL,
        feature_code character varying(10),
        feature_area_sqm double precision,
        feature_length_m double precision,
        geometry_length double precision,
        geometry_area double precision,
        geog public.geography(MultiPolygon,4326)
    );

    ALTER TABLE public.utm_zones OWNER TO invasivebc;

    COMMENT ON COLUMN public.utm_zones.geog IS 'Geography type spatial data.';

    CREATE SEQUENCE public.utm_zones_objectid_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;

    ALTER TABLE public.utm_zones_objectid_seq OWNER TO invasivebc;

    ALTER SEQUENCE public.utm_zones_objectid_seq OWNED BY public.utm_zones.objectid;

    ALTER TABLE ONLY public.utm_zones ALTER COLUMN objectid SET DEFAULT nextval('public.utm_zones_objectid_seq'::regclass);

    insert into  public.utm_zones (objectid, utm_zone, feature_code, feature_area_sqm, feature_length_m, geometry_length, geometry_area, geog) values 
    (1, 7, 'RG90000000',  61090657306.1955032, 1846710.85690000001, 1846710.85694559989, 61090657306.1958008, '0106000020E610000001000000010300000001000000080000004993FBFFFF3F61C0999EB65BF77E4A40D0CDDC6BCD4761C0FB223E803FEA4A402AE3E8B8F66961C041C3A17A5D914C4017308A9B597D61C004879EB0BC644D40DA157B118F9261C0F01D33343A384E40472EDD6E025661C0F55EDAAEAE4F4E406216DDFFFF3F61C069CBE3EE5B574E404993FBFFFF3F61C0999EB65BF77E4A40'),
    (2, 8, 'RG90000000',  555335113693.805054, 3694981.66170000006, 3694981.66172356997, 555335113693.802979, '0106000020E6100000010000000103000000010000000A0000006216DDFFFF3F61C069CBE3EE5B574E40F44B963EDE1861C087C78619E8634E401F418D6037DB60C08AD87A4DDA744E406EE6F0D3239D60C074DF3DE67A824E40E5530800008060C0F80A21DBB3874E40EB120100008060C0970C335A44C54740401B68508A1161C07C02B5BA719647401D0BD88CAB2A61C0FC7C9D889E4149404993FBFFFF3F61C0999EB65BF77E4A406216DDFFFF3F61C069CBE3EE5B574E40'),
    (3, 9, 'RG90000000',  583574229000,  3783502.77279999992, 3783502.77277796995, 583574229000.000977, '0106000020E6100000010000000103000000010000000B000000E5530800008060C0F80A21DBB3874E404DBE6A8CBA5E60C09C01E063C18C4E40011D1542132060C07FAFC147A7934E4073393D7A8CC25FC0DAC1062B28974E400000000000805FC00E654353A2974E400000000000805FC0A3E4FAE771DB4740083BA4BAD1AF5FC03CC76F221ADB4740F6FF44AD0D0560C0002E568795D8474021C58320245F60C09D39E93B39CC4740EB120100008060C0970C335A44C54740E5530800008060C0F80A21DBB3874E40'),
    (4, 10,  'RG90000000',  583574213250,  3783502.75139999995, 3783502.75135469995, 583574213250,  '0106000020E6100000010000000103000000010000000C0000000000000000805FC00E654353A2974E405C8D623CD8445FC0D2D707CE41974E407E54AC493BC75EC0E81A4820F4934E40D1AF47EAE6495EC08FCAAF40418D4E406C028D0000005EC0A6292EDBB3874E40DAF1B50000005EC08661485A44C54740C79DAF6501475EC0A3239AE6B9CC474083A705F203A15EC065220671FBD347406A5F61AC33FB5EC07AD06BC5CCD84740F7D7D4607E555FC03A112C8E2CDB47400000000000805FC0A3E4FAE771DB47400000000000805FC00E654353A2974E40'),
    (5, 11,  'RG90000000',  591630772456.921021, 3803477.56609999994, 3803477.5661195498,  591630772456.921021, '0106000020E6100000010000000103000000010000000B0000006C028D0000005EC0A6292EDBB3874E4036D41BBC0BCD5DC08BBA09762D834E409AD74943D9505DC097CEFF1FBF754E40381A750200805CC0077C42EF5B574E4063F45E0000805CC0E30B5DABEDD447404E4A6BF5038A5CC007B6DF6F3B844740A9575729BB3A5DC0DDFB09416BA84740D7942680CB935DC0D46BA1D6EEB64740A67B9E043EED5DC0C5902D260AC34740DAF1B50000005EC08661485A44C547406C028D0000005EC0A6292EDBB3874E40'),
    (6, 12,  'RG90000000',  174795014293.07901,  3123748.12880000006, 3123748.12876485009, 174795014293.07901,  '0106000020E61000000100000001030000000100000009000000381A750200805CC0077C42EF5B574E409858D03D206A5BC064C9FBB63F1F4E4083E1452CC1105CC0BCF28B0F51D54A4045FE2BCE86325CC0A36E456409024A40BAD72DC0D3515CC083D313F32B2E49402F115F0DA2605CC001B090C8FBC34840CE9FE251EA6E5CC0DBFDAF419B59484063F45E0000805CC0E30B5DABEDD44740381A750200805CC0077C42EF5B574E40');

    SELECT pg_catalog.setval('public.utm_zones_objectid_seq', 6, true);

    ALTER TABLE ONLY public.utm_zones
        ADD CONSTRAINT utm_zones_pk PRIMARY KEY (objectid);

   CREATE INDEX utm_zones_gist2 ON public.utm_zones USING gist (geog);
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
