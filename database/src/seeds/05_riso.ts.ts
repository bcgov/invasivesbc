import * as Knex from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const request = new Request(
    'https://quartech.s3.ca-central-1.amazonaws.com/regional_invasive_species_organization_areas.sql.gz'
  );

  const reply = await fetch(request);
  console.log(reply);

  //await knex.raw(`alter sequence ${DB_SCHEMA}.code_code_id_seq restart with 1`);

  // Deletes ALL existing entries
  // await knex("table_name").del();

  // // Inserts seed entries
  // await knex("table_name").insert([
  //     { id: 1, colName: "rowValue1" },
  //     { id: 2, colName: "rowValue2" },
  //     { id: 3, colName: "rowValue3" }
  // ]);
}
