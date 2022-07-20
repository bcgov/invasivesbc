import { Knex } from 'knex';
import parse from 'csv-parse';
import * as fs from 'fs';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function seed(knex: Knex): Promise<void> {
  const category_id = await _load_category(knex);
  const header_name_map = await _load_headers(knex, category_id);
  await _load_codes(knex, header_name_map);
}

async function _load_category(knex: Knex): Promise<number> {
  // Insert code_category entry
  const category_id = (
    await knex('code_category')
      .withSchema(DB_SCHEMA)
      .returning('code_category_id')
      .insert([
        {
          code_category_name: 'invasives',
          code_category_title: 'Invasives Codes',
          code_category_description: 'The category for invasives codes',
          created_by_user_id: 1,
          updated_by_user_id: 1
        }
      ])
  )[0];

  return (category_id as any).code_category_id;
}

async function _load_headers(knex: Knex, category_id: number): Promise<Map<string, number>> {
  const file = __dirname + '/data/invasives/business_codes.csv';

  const header_name_map = new Map<string, number>();

  const headerRows = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(
        parse({
          columns: true,
          trim: true
        })
      )
      .on('data', (dataRow) => {
        const header_id = 0;

        if (!header_name_map.has(dataRow.code_header_name)) {
          // record the new header name
          header_name_map.set(dataRow.code_header_name, header_id);

          // construct the header row and add it to the header rows array
          const extendedRow = {
            code_category_id: category_id,
            code_header_name: dataRow.code_header_name,
            code_header_title: dataRow.code_header_name,
            code_header_description: dataRow.code_header_name,
            valid_from: knex.fn.now(),
            created_by_user_id: 1,
            updated_by_user_id: 1
          };
          headerRows.push(extendedRow);
        }
      })
      .on('error', (error) => reject(error))
      .on('end', () => {
        resolve();
      });
  });

  // insert headers
  const headerResults = (await knex('code_header').withSchema(DB_SCHEMA).returning('*').insert(headerRows)) as object[];

  // update the header name map
  headerResults.forEach((result) => {
    header_name_map.set(result['code_header_name'], result['code_header_id']);
  });

  return header_name_map;
}

async function _load_codes(knex: Knex, header_name_map: Map<string, number>): Promise<void> {
  const file = __dirname + '/data/invasives/business_codes.csv';

  const results = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(
        parse({
          columns: true,
          trim: true
        })
      )
      .on('data', (dataRow) => {
        const extendedRow = {
          code_header_id: header_name_map.get(dataRow.code_header_name),
          code_name: dataRow.code_name,
          code_description: dataRow.code_description,
          code_sort_order: dataRow.code_sort_order,
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
