import { SQL } from 'sql-template-strings';

export const getPublicMapTileQuery = (filterObject: { z: number, x: number, y: number }) => {

  const stmt = SQL`WITH mvtgeom AS
                            (SELECT ST_AsMVTGeom(ST_Transform(geog::geometry, 3857),
                                                 ST_TileEnvelope($1, $2, $3), extent => 4096,
                                                 buffer => 64) AS geom,
                                    site_id                    as feature_id,
                                    reported_area
                                    -- can include whatever other properties are needed in this query also and they will be added as attributes
                             FROM iapp_site_summary_and_geojson
                             WHERE ST_Transform(geog::geometry, 3857) && ST_TileEnvelope($1, $2, $3))
                   SELECT ST_AsMVT(mvtgeom.*, 'data', 4096, 'geom', 'feature_id') as data
                   FROM mvtgeom;`;
  stmt.values = [filterObject.z, filterObject.x, filterObject.y];

  return stmt;
};

export const PUBLIC_IAPP_SQL = SQL`SELECT i.geojson as feature
                                   from iapp_site_summary_and_geojson i`;

export const PUBLIC_ACTIVITY_SQL = SQL`select jsonb_build_object(
                                                'type', 'Feature',
                                                'id', a.short_id,
                                                'geometry', st_asgeojson(a.geog)::jsonb,
                                                'properties', jsonb_build_object(
                                                  'id', a.short_id,
                                                  'activityType', a.activity_type,
                                                  'speciesPositive', a.species_positive,
                                                  'speciesNegative', a.species_negative,
                                                  'speciesPositiveFull', a.species_positive_full,
                                                  'speciesNegativeFull', a.species_negative_full,
                                                  'jurisdiction', a.jurisdiction_display,
                                                  'RISO', a.regional_invasive_species_organization_areas,
                                                  'agency', a.agency,
                                                  'regionalDistricts', a.regional_districts,
                                                  'MOTIDistricts', a.moti_districts,
                                                  'FLNRODistricts', a.flnro_districts)) as feature
                                       from activity_incoming_data as a
                                       where a.form_status = 'Submitted'
                                         and a.activity_type = 'Observation'`;
