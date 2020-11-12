import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function seed(knex: Knex): Promise<void> {
  await knex('code').withSchema(DB_SCHEMA).del();
  await knex('code_header').withSchema(DB_SCHEMA).del();
  await knex('code_category').withSchema(DB_SCHEMA).del();

  await knex.raw(`alter sequence ${DB_SCHEMA}.code_code_id_seq restart with 1`);
  await knex.raw(`alter sequence ${DB_SCHEMA}.code_header_code_header_id_seq restart with 1`);
  await knex.raw(`alter sequence ${DB_SCHEMA}.code_category_code_category_id_seq restart with 1`);
}
