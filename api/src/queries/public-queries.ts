import SQL, { SQLStatement } from 'sql-template-strings';

export function getPublicActivitiesSQL(): SQLStatement {
  const f: SQLStatement = SQL`select a.activity_type,
                                     a.activity_subtype,
                                     a.flnro_districts,
                                     a.moti_districts,
                                     a.invasive_plant_management_areas,
                                     a.jurisdiction,
                                     a.regional_invasive_species_organization_areas,
                                     a.well_proximity,
                                     a.species_positive,
                                     a.species_negative,
                                     a.regional_districts,
                                     a.received_timestamp,
                                     a.short_id,
                                     st_asgeojson(a.geog) as geo
                              from activity_incoming_data a
                              where a.form_status = 'Submitted'
                                and a.activity_type = 'Observation'`;

  return f;
}
