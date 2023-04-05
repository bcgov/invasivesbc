import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    create table provincial_boundary (
      id integer UNIQUE default(1),
      constraint single_row_constraint check (id = 1),
      geog geography(Polygon,4326) not null
    );

`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    DROP TABLE provincial_boundary;
    `);
}
