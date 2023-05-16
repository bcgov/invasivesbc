import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path = invasivesbc,public;

    CREATE OR REPLACE FUNCTION compute_geo_autofill(in wkt TEXT) RETURNS geo_autofill AS $$
    DECLARE centroid geometry;
    DECLARE utm_srid integer;
    DECLARE centroid_in_utm_srid geometry;
    DECLARE ret geo_autofill;
BEGIN
    -- assume source data are in srid 4326 (lat/lon)
    SELECT ST_GeomFromText($1, 4326) INTO ret.geo;

    SELECT ST_centroid(ret.geo, true) INTO centroid;

    SELECT round(ST_X(centroid)::numeric, 6)::float8 INTO ret.longitude;
    SELECT round(ST_Y(centroid)::numeric, 6)::float8 INTO ret.latitude;

    -- to compute utm zone for lat/lon coordinates
    SELECT floor((ret.longitude + 180)/6) + 1 INTO ret.utm_zone;

    -- srid for utm zone in northern hemisphere is zone + 32600
    SELECT 32600 + ret.utm_zone INTO utm_srid;

    -- transform centroid lat/lon into utm spatial reference for that zone
    SELECT ST_Transform(centroid, utm_srid) INTO centroid_in_utm_srid;

    SELECT round(ST_X(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_easting;
    SELECT round(ST_Y(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_northing;

    -- in srid 4326, so result is square meters.
    SELECT round(ST_Area(ST_Transform(ret.geo, 3005)))::integer INTO ret.area;

    SELECT ST_AsGeoJSON(ret.geo) INTO ret.geojson;

    -- boolean -- true if it is wholly covered by the poly bounding the province
    SELECT exists(select ST_Intersects((SELECT ST_Subdivide(geog::geometry) from provincial_boundary where id = 1), ret.geo)) INTO ret.within_bc;


    select public.geography(
      public.ST_Force2D(
        public.ST_SetSRID(
          ret.geo, 4326
        )
      )
    ) into ret.geog;

    RETURN ret;
END;
$$ LANGUAGE plpgsql;
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = invasivesbc,public;

    CREATE OR REPLACE FUNCTION compute_geo_autofill(in wkt TEXT) RETURNS geo_autofill AS $$
    DECLARE centroid geometry;
    DECLARE utm_srid integer;
    DECLARE centroid_in_utm_srid geometry;
    DECLARE ret geo_autofill;
BEGIN
    -- assume source data are in srid 4326 (lat/lon)
    SELECT ST_GeomFromText($1, 4326) INTO ret.geo;

    SELECT ST_centroid(ret.geo, true) INTO centroid;

    SELECT round(ST_X(centroid)::numeric, 6)::float8 INTO ret.longitude;
    SELECT round(ST_Y(centroid)::numeric, 6)::float8 INTO ret.latitude;

    -- to compute utm zone for lat/lon coordinates
    SELECT floor((ret.longitude + 180)/6) + 1 INTO ret.utm_zone;

    -- srid for utm zone in northern hemisphere is zone + 32600
    SELECT 32600 + ret.utm_zone INTO utm_srid;

    -- transform centroid lat/lon into utm spatial reference for that zone
    SELECT ST_Transform(centroid, utm_srid) INTO centroid_in_utm_srid;

    SELECT round(ST_X(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_easting;
    SELECT round(ST_Y(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_northing;

    -- in srid 4326, so result is square meters.
    SELECT round(ST_Area(ret.geo))::integer INTO ret.area;

    SELECT ST_AsGeoJSON(ret.geo) INTO ret.geojson;

    -- boolean -- true if it is wholly covered by the poly bounding the province
    SELECT ST_Covers((SELECT geog from provincial_boundary where id = 1), ret.geo) INTO ret.within_bc;


    select public.geography(
      public.ST_Force2D(
        public.ST_SetSRID(
          ret.geo, 4326
        )
      )
    ) into ret.geog;

    RETURN ret;
END;
$$ LANGUAGE plpgsql;

  `);
}
