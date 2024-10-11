import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      CREATE TABLE invasivesbc.provincial_boundary_subdivide
      (
        id   serial4 primary key,
        geom public.geometry(Polygon, 4326) not null
      );

      INSERT INTO invasivesbc.provincial_boundary_subdivide (geom)
      SELECT (public.st_subdivide(geog::public.geometry))
      FROM invasivesbc.provincial_boundary
      WHERE id = 1;

      CREATE INDEX ON invasivesbc.provincial_boundary_subdivide USING GIST (geom);

      CREATE OR REPLACE FUNCTION invasivesbc.compute_geo_autofill(wkt text)
        RETURNS invasivesbc.geo_autofill
        LANGUAGE plpgsql
      AS
      $function$
      DECLARE
        centroid                     public.geometry;
        DECLARE utm_srid             integer;
        DECLARE centroid_in_utm_srid public.geometry;
        DECLARE ret                  invasivesbc.geo_autofill;
      BEGIN
        -- assume source data are in srid 4326 (lat/lon)
        SELECT public.ST_GeomFromText($1, 4326) INTO ret.geo;

        SELECT public.ST_centroid(ret.geo, true) INTO centroid;

        SELECT round(public.ST_X(centroid)::numeric, 6)::float8 INTO ret.longitude;
        SELECT round(public.ST_Y(centroid)::numeric, 6)::float8 INTO ret.latitude;

        -- to compute utm zone for lat/lon coordinates
        SELECT floor((ret.longitude + 180) / 6) + 1 INTO ret.utm_zone;

        -- srid for utm zone in northern hemisphere is zone + 32600
        SELECT 32600 + ret.utm_zone INTO utm_srid;

        -- transform centroid lat/lon into utm spatial reference for that zone
        SELECT public.ST_Transform(centroid, utm_srid) INTO centroid_in_utm_srid;

        SELECT round(public.ST_X(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_easting;
        SELECT round(public.ST_Y(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_northing;

        SELECT public.ST_AsGeoJSON(ret.geo) INTO ret.geojson;

        -- boolean -- true if it is wholly covered by the poly bounding the province
        SELECT EXISTS (SELECT 1
                       FROM invasivesbc.provincial_boundary_subdivide pbs
                       WHERE pbs.geom && ret.geo
                         AND ST_Intersects(pbs.geom, ret.geo))
        INTO ret.within_bc;


        select public.geography(
                 public.ST_Force2D(
                   public.ST_SetSRID(
                     ret.geo, 4326
                   )
                 )
               )
        into ret.geog;

        -- in srid 4326, so result is square meters.
        SELECT case
                 when round(public.ST_Area(ret.geog))::integer = 0 then 1
                 else round(public.ST_Area(ret.geog))::integer end
        INTO ret.area;

        RETURN ret;
      END;
      $function$
      ;
    `
  );
}

export async function down(knex: Knex) {
  //language=PostgreSQL
  await knex.raw(
    `
      set search_path = invasivesbc, public;

      drop table invasivesbc.provincial_boundary_subdivide;

      CREATE OR REPLACE FUNCTION invasivesbc.compute_geo_autofill(wkt text) RETURNS invasivesbc.geo_autofill
        LANGUAGE plpgsql
      AS
      $_$
      DECLARE
        centroid                     public.geometry;
        DECLARE utm_srid             integer;
        DECLARE centroid_in_utm_srid public.geometry;
        DECLARE ret                  invasivesbc.geo_autofill;
      BEGIN
        -- assume source data are in srid 4326 (lat/lon)
        SELECT public.ST_GeomFromText($1, 4326) INTO ret.geo;

        SELECT public.ST_centroid(ret.geo, true) INTO centroid;

        SELECT round(public.ST_X(centroid)::numeric, 6)::float8 INTO ret.longitude;
        SELECT round(public.ST_Y(centroid)::numeric, 6)::float8 INTO ret.latitude;

        -- to compute utm zone for lat/lon coordinates
        SELECT floor((ret.longitude + 180) / 6) + 1 INTO ret.utm_zone;

        -- srid for utm zone in northern hemisphere is zone + 32600
        SELECT 32600 + ret.utm_zone INTO utm_srid;

        -- transform centroid lat/lon into utm spatial reference for that zone
        SELECT public.ST_Transform(centroid, utm_srid) INTO centroid_in_utm_srid;

        SELECT round(public.ST_X(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_easting;
        SELECT round(public.ST_Y(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_northing;

        SELECT public.ST_AsGeoJSON(ret.geo) INTO ret.geojson;

        -- boolean -- true if it is wholly covered by the poly bounding the province
        WITH split_boundary AS
               (SELECT public.St_subdivide(geog::public.geometry) AS split_g
                FROM invasivesbc.provincial_boundary
                WHERE id = 1),
             intersecting AS
               (SELECT *
                FROM split_boundary
                WHERE St_intersects(split_g, ret.geo))
        SELECT EXISTS
                 (SELECT *
                  FROM intersecting)
        INTO ret.within_bc;

        select public.geography(
                 public.ST_Force2D(
                   public.ST_SetSRID(
                     ret.geo, 4326
                   )
                 )
               )
        into ret.geog;

        -- in srid 4326, so result is square meters.
        SELECT case
                 when round(public.ST_Area(ret.geog))::integer = 0 then 1
                 else round(public.ST_Area(ret.geog))::integer end
        INTO ret.area;

        RETURN ret;
      END;
      $_$;

    `
  );
}
