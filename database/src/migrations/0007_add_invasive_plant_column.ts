import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path = invasivesbc,public;


      alter table activity_incoming_data
        add column if not exists invasive_plant text generated always as (coalesce(species_positive_full,
                                                                                   species_negative_full,
                                                                                   species_treated_full)) stored;

    `
  );
}

export async function down(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path to invasivesbc, public;

      alter table activity_incoming_data
        drop column invasive_plant;

    `
  );
}
