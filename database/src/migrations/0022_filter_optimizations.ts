import { Knex } from 'knex';

export async function up(knex: Knex) {

  await knex.raw(
    //language=PostgreSQL
    `
    create materialized view if not exists invasivesbc.current_positive_observations_aggregated_invasive_plant_materialized AS (
      SELECT
             cpo.activity_incoming_data_id,
             string_agg (cpo.invasive_plant, ', ') AS current_positive_species
      FROM
             invasivesbc.current_positive_observations_materialized cpo
      GROUP BY
             cpo.activity_incoming_data_id
);




create materialized view if not exists invasivesbc.current_negative_observations_aggregated_invasive_plant_materialized AS (
      SELECT
             cno.activity_incoming_data_id,
             string_agg (cno.invasive_plant, ', ') AS current_negative_species
      FROM
             invasivesbc.current_negative_observations_materialized cno
      GROUP BY
             cno.activity_incoming_data_id
);


create materialized view if not exists invasivesbc.activity_date_for_filters_materialized as (
  select activity_incoming_data_id, substring((activity_payload::json->'form_data'->'activity_data'->'activity_date_time'::text)::text, 2, 10) as activity_date_for_filter
  from invasivesbc.activity_incoming_data
  )

  create materialized view if not exists invasivesbc.project_code_for_filters_materialized as (
    select activity_incoming_data_id,  (activity_payload::json->'form_data'->'activity_data'->'project_code'::text)::text as project_code_for_filter
    from invasivesbc.activity_incoming_data
    )

    CREATE INDEX IF NOT EXISTS activity_date_for_filters_materialized_activity_incoming_data_id_idx ON invasivesbc.activity_date_for_filters_materialized (activity_incoming_data_id);
    CREATE INDEX IF NOT EXISTS activity_date_for_filters_materialized_activity_date_for_filter_idx ON invasivesbc.activity_date_for_filters_materialized (activity_date_for_filter);
    CREATE INDEX IF NOT EXISTS project_code_for_filters_materialized_activity_incoming_data_id_idx ON invasivesbc.project_code_for_filters_materialized (activity_incoming_data_id);
    CREATE INDEX IF NOT EXISTS project_code_for_filters_materialized_project_code_for_filter_idx ON invasivesbc.project_code_for_filters_materialized (project_code_for_filter);
    CREATE INDEX IF NOT EXISTS current_negative_observations_aggregated_invasive_plant_materia_activity_incoming_data_id_idx ON invasivesbc.current_negative_observations_aggregated_invasive_plant_materia (activity_incoming_data_id);
    CREATE INDEX IF NOT EXISTS current_positive_observations_aggregated_invasive_plant_materialized_activity_incoming_data_id_idx ON invasivesbc.current_positive_observations_aggregated_invasive_plant_materialized (activity_incoming_data_id);
    CREATE INDEX IF NOT EXISTS current_positive_observations_aggregated_invasive_plant_materialized_current_positive_species_idx ON invasivesbc.current_positive_observations_aggregated_invasive_plant_materialized (current_positive_species);
    CREATE INDEX IF NOT EXISTS current_negative_observations_aggregated_invasive_plant_materialized_current_negative_species_idx ON invasivesbc.current_negative_observations_aggregated_invasive_plant_materialized (current_negative_species);


    `);

}

export async function down(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
        set search_path to invasivesbc, public;


    `);
}
