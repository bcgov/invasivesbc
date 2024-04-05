import { SQL } from 'sql-template-strings';

export const getPublicMapTileQuery = (filterObject: { z: number, x: number, y: number }) => {

  const stmt = SQL`WITH mvtgeom AS
                            (SELECT ST_AsMVTGeom(ST_Transform(geog::geometry, 3857),
                                                 ST_TileEnvelope($1, $2, $3), extent => 4096,
                                                 buffer => 64)                 AS geom,
                                    a.site_id                                  as feature_id,
                                    'IAPP'                                     as type,
                                    a.site_id::text                            as site_id,
                                    a.all_species_on_site                      as species_positive,
                                    a.agencies                                 as agencies,
                                    a.regional_invasive_species_organization   as riso,
                                    array_to_string(a.jurisdictions, ', ', '') as jurisdictions
                             FROM iapp_site_summary_and_geojson a
                                      join iapp_site_summary b on a.site_id = b.site_id
                             WHERE ST_Transform(geog::geometry, 3857) && ST_TileEnvelope($1, $2, $3)
                             UNION
                             SELECT ST_AsMVTGeom(ST_Transform(geog::geometry, 3857),
                                                 ST_TileEnvelope($1, $2, $3), extent => 4096,
                                                 buffer => 64)                       AS geom,
                                    act.activity_incoming_data_id                    as feature_id,
                                    'Activity'                                       as type,
                                    act.short_id                                     as site_id,
                                    act.species_positive_full                        as species_positive,
                                    act.agency                                       as agencies,
                                    act.regional_invasive_species_organization_areas as riso,
                                    act.jurisdiction_display                         as jurisdictions
                             from activity_incoming_data as act
                             where act.form_status = 'Submitted'
                               and act.activity_type = 'Observation'
                               and ST_Transform(geog::geometry, 3857) && ST_TileEnvelope($1, $2, $3))
                   SELECT ST_AsMVT(mvtgeom.*, 'data', 4096, 'geom', 'feature_id') as data
                   FROM mvtgeom
  `;
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
