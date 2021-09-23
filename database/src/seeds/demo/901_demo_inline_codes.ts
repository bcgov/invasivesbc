import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function seed(knex: Knex): Promise<void> {
  await knex('code').withSchema(DB_SCHEMA).del();
  await knex('code_header').withSchema(DB_SCHEMA).del();
  await knex('code_category').withSchema(DB_SCHEMA).del();

  await knex.raw(`alter sequence ${DB_SCHEMA}.code_code_id_seq restart with 1`);
  await knex.raw(`alter sequence ${DB_SCHEMA}.code_header_code_header_id_seq restart with 1`);
  await knex.raw(`alter sequence ${DB_SCHEMA}.code_category_code_category_id_seq restart with 1`);

  // Insert code_category entries
  const cc_invasives_id = await knex('code_category')
    .withSchema(DB_SCHEMA)
    .returning('code_category_id')
    .insert([
      {
        code_category_name: 'DEMO_INVASIVES',
        code_category_title: 'Invasives BC Codes',
        code_category_description: 'The codes for Invasives BC as designed by Mike Shasko',
        created_by_user_id: 1,
        updated_by_user_id: 1
      }
    ]);

  // Insert code_header entries
  const ch_country_id = await knex('code_header').withSchema(DB_SCHEMA).returning('code_header_id').insert({
    code_category_id: cc_invasives_id[0],
    code_header_name: 'COUNTRY',
    code_header_title: 'Country',
    code_header_description: 'Countries of the world',
    valid_from: knex.fn.now(),
    created_by_user_id: 1,
    updated_by_user_id: 1
  });

  // Insert code entries
  await knex('code')
    .withSchema(DB_SCHEMA)
    .insert([
      {
        code_header_id: ch_country_id[0],
        code_name: 'CA',
        code_description: 'Canada',
        code_sort_order: 0,
        valid_from: knex.fn.now(),
        created_by_user_id: 1,
        updated_by_user_id: 1
      },
      {
        code_header_id: ch_country_id[0],
        code_name: 'US',
        code_description: 'United States',
        code_sort_order: 1,
        valid_from: knex.fn.now(),
        created_by_user_id: 1,
        updated_by_user_id: 1
      },
      {
        code_header_id: ch_country_id[0],
        code_name: 'MX',
        code_description: 'Mexico',
        code_sort_order: 2,
        valid_from: knex.fn.now(),
        created_by_user_id: 1,
        updated_by_user_id: 1
      }
    ]);
}
