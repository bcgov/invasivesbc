import { Knex } from 'knex';
import parse from 'csv-parse';
import * as fs from 'fs';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function seed(knex: Knex): Promise<void> {
  const header_id = await _load_category_and_header(knex);
  await _load_codes(knex, header_id);
}

async function _load_category_and_header(knex: Knex): Promise<any> {
  // Insert code_category entry
  const category_id = (
    await knex('code_category')
      .withSchema(DB_SCHEMA)
      .returning('code_category_id')
      .insert([
        {
          code_category_name: 'system',
          code_category_title: 'System Codes',
          code_category_description: 'The category for system codes',
          created_by_user_id: 1,
          updated_by_user_id: 1
        }
      ])
  )[0];

  // Insert code_header entry
  const header_id = (
    await knex('code_header')
      .withSchema(DB_SCHEMA)
      .returning('code_header_id')
      .insert({
        code_category_id: (category_id as any).code_category_id,
        code_header_name: 'app_role_code',
        code_header_title: 'Application Access Role Codes',
        code_header_description:
          'This category holds definition of different user roles of the system along with cross domain code',
        valid_from: knex.fn.now(),
        created_by_user_id: 1,
        updated_by_user_id: 1
      })
  )[0];

  return (header_id as any).code_header_id;
}

async function _load_codes(knex: Knex, header_id: any): Promise<void> {
  const file = __dirname + '/data/system/app_role_codes.csv';

  const results = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(
        parse({
          columns: true
        })
      )
      .on('data', (dataRow) => {
        const extendedRow = {
          ...dataRow,
          code_header_id: header_id,
          valid_from: knex.fn.now(),
          created_by_user_id: 1,
          updated_by_user_id: 1
        };
        results.push(extendedRow);
      })
      .on('error', (error) => reject(error))
      .on('end', () => {
        resolve();
      });
  });

  // Insert code entries
  await knex('code').withSchema(DB_SCHEMA).insert(results);
}
