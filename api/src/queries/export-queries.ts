import { SQL } from 'sql-template-strings';

export const PUBLIC_IAPP_SQL = SQL`SELECT i.site_id as key,
                                          i.geojson as feature
                                   from iapp_site_summary_and_geojson i
                                   order by i.site_id desc`;

//language=PostgreSQL
export const ALL_ACTIVITY_SQL = SQL`
    WITH CurrentPositiveObservations
             AS
             (SELECT cpo.activity_incoming_data_id,
                     string_agg(cpo.invasive_plant, ', ')
                         AS
                         current_positive_species
              FROM current_positive_observations_materialized cpo
              GROUP BY cpo.activity_incoming_data_id),

         CurrentNegativeObservations
             AS
             (SELECT cno.activity_incoming_data_id,
                     string_agg(cno.invasive_plant, ', ')
                         AS
                         current_negative_species
              FROM current_negative_observations_materialized cno
              GROUP BY cno.activity_incoming_data_id)

    select a.activity_id as key,
           jsonb_build_object(
                   'type', 'Feature',
                   'id', a.activity_id,
                   'properties', jsonb_build_object(
                           'short_id', a.short_id,
                           'id', a.activity_id,
                           'type', a.activity_type,
                           'subtype', activity_subtype,
                           'map_symbol', a.map_symbol,
                           'species_positive', species_positive,
                           'species_negative', species_negative,
                           'species_treated', species_treated,
                           'created', created_timestamp,
                           'jurisdiction',
                           a.activity_payload::json -> 'form_data' -> 'activity_data' -> 'jurisdictions',
                           'reported_area', a.activity_payload -> 'form_data' -> 'activity_data' -> 'reported_area',
                           'computedCentroid', jsonb_build_array(
                                   ST_X(ST_Centroid(a.geog)::geometry),
                                   ST_Y(ST_Centroid(a.geog)::geometry)
                               )
                       ),
                   'geometry', st_asgeojson(a.geog)::jsonb
               )         as
                            feature
            ,
           CASE
               WHEN
                   cpo.activity_incoming_data_id IS NOT NULL
                   THEN
                   TRUE
               ELSE
                   FALSE
               END
                         AS
                            has_current_positive,

           cpo.current_positive_species,

           CASE
               WHEN
                   cno.activity_incoming_data_id IS NOT NULL THEN TRUE
               ELSE FALSE
               END       as has_current_negative,
           cno.current_negative_species

    from activity_incoming_data a

             LEFT JOIN
         CurrentPositiveObservations cpo
         ON
             cpo.activity_incoming_data_id = a.activity_incoming_data_id
             LEFT JOIN
         CurrentNegativeObservations cno
         ON
             cno.activity_incoming_data_id = a.activity_incoming_data_id

    where 1 = 1
      and a.iscurrent = true
      and a.form_status = 'Submitted'

    order by a.activity_incoming_data_id desc

`;
