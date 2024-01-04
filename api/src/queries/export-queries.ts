import { SQL } from "sql-template-strings";

export const PUBLIC_IAPP_SQL = SQL`SELECT i.site_id as key,
                                          i.geojson as feature
                                   from iapp_site_summary_and_geojson i
                                   order by i.site_id desc`;

export const ALL_ACTIVITY_SQL = SQL`select a.activity_id                                    as key,
                                           jsonb_build_object(
                                                   'type', 'Feature',
                                                   'id', a.short_id,
                                                   'properties', jsonb_build_object(
                                                           'shortId', a.short_id,
                                                           'activityType', a.activity_type,
                                                           'speciesPositive', a.species_positive,
                                                           'speciesNegative', a.species_negative,
                                                           'jurisdiction', a.jurisdiction_display,
                                                           'reportedArea',
                                                           a.activity_payload -> 'form_data' -> 'activity_data' ->
                                                           'reported_area',
                                                           'computedCentroid', jsonb_build_array(
                                                                   ST_X(ST_Centroid(a.geog)::geometry),
                                                                   ST_Y(ST_Centroid(a.geog)::geometry)
                                                               )
                                                       ),
                                                   'geometry', st_asgeojson(a.geog)::jsonb) as feature
                                    from activity_incoming_data as a
                                    order by a.activity_incoming_data_id desc
`;
