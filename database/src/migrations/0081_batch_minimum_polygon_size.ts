import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;

    CREATE OR REPLACE FUNCTION invasivesbc.compute_geo_autofill(wkt text)
    RETURNS invasivesbc.geo_autofill
    LANGUAGE plpgsql
   AS $function$
       DECLARE centroid public.geometry;
       DECLARE utm_srid integer;
       DECLARE centroid_in_utm_srid public.geometry;
       DECLARE ret invasivesbc.geo_autofill;
   BEGIN
       -- assume source data are in srid 4326 (lat/lon)
       SELECT public.ST_GeomFromText($1, 4326) INTO ret.geo;
   
       SELECT public.ST_centroid(ret.geo, true) INTO centroid;
   
       SELECT round(public.ST_X(centroid)::numeric, 6)::float8 INTO ret.longitude;
       SELECT round(public.ST_Y(centroid)::numeric, 6)::float8 INTO ret.latitude;
   
       -- to compute utm zone for lat/lon coordinates
       SELECT floor((ret.longitude + 180)/6) + 1 INTO ret.utm_zone;
   
       -- srid for utm zone in northern hemisphere is zone + 32600
       SELECT 32600 + ret.utm_zone INTO utm_srid;
   
       -- transform centroid lat/lon into utm spatial reference for that zone
       SELECT public.ST_Transform(centroid, utm_srid) INTO centroid_in_utm_srid;
   
       SELECT round(public.ST_X(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_easting;
       SELECT round(public.ST_Y(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_northing;
   
       SELECT public.ST_AsGeoJSON(ret.geo) INTO ret.geojson;
   
       -- boolean -- true if it is wholly covered by the poly bounding the province
       SELECT exists(select public.ST_Intersects((SELECT public.ST_Subdivide(geog::public.geometry) from invasivesbc.provincial_boundary where id = 1), ret.geo)) INTO ret.within_bc;
   
       select public.geography(
         public.ST_Force2D(
           public.ST_SetSRID(
             ret.geo, 4326
           )
         )
       ) into ret.geog;
      
        -- in srid 4326, so result is square meters.
        SELECT case when round(public.ST_Area(ret.geog))::integer = 0 then 1 else round(public.ST_Area(ret.geog))::integer end INTO ret.area;
   
       RETURN ret;
   END;
   $function$
   ;
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  
  set search_path = invasivesbc,public;

  `);
}
