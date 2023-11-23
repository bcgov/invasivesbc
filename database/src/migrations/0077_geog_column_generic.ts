import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;

    ALTER TABLE admin_defined_shapes ALTER COLUMN geog TYPE geography(Geometry,4326);
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=invasivesbc,public;

  `);
}
