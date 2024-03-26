import { Knex } from 'knex';

export async function up(knex: Knex) {

  await knex.raw(
    //language=PostgreSQL
    `
      set search_path to invasivesbc, public;
      create index "activities_vector_tile_transform_index" on activity_incoming_data using gist (ST_Transform(geog::geometry, 3857));
      create index "iapp_vector_tile_transform_index" on iapp_site_summary_and_geojson using gist (ST_Transform(geog::geometry, 3857));
    `);

}

export async function down(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
        set search_path to invasivesbc, public;
        drop index "activities_vector_tile_transform_index";
        drop index "iapp_vector_tile_transform_index";
    `);
}
