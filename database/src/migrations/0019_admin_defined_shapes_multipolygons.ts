import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  
  await knex.raw(`
  set search_path=invasivesbc,public;

  ALTER TABLE admin_defined_shapes ALTER COLUMN geog type geography(MultiPolygon, 4326) using ST_Multi(geog::geometry);

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    ALTER TABLE admin_defined_shapes ALTER COLUMN geog type geography(Polygon, 4326);
    `);
}