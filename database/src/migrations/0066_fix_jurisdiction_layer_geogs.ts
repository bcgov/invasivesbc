import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;

    update public.jurisdiction 
    set geog = ST_CollectionExtract(ST_MakeValid(geog::geometry),3)::geography
    where not ST_IsValid(geog::geometry);
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  `);
}
