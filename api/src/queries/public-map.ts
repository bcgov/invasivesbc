import {SQL} from "sql-template-strings";

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
