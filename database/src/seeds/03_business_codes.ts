import * as Knex from "knex";
import parse from "csv-parse";
const fs = require('fs');

export async function seed(knex: Knex): Promise<void> {
  let category_id = await _load_category(knex);
  let header_name_map = await _load_headers(knex, category_id);
  await _load_codes(knex, header_name_map);
};

async function _load_category(knex: Knex): Promise<number> {
    // Insert code_category entry
    let category_id = (await knex("code_category").withSchema('invasivesbc').returning('code_category_id').insert([
        { code_category_name: 'invasives', code_category_title: 'Invasives Codes', 
            code_category_description: 'The category for invasives codes', created_by_user_id: 1, updated_by_user_id: 1},
    ]))[0];

    // Insert code_header entry
    // const header_id = (await knex("code_header").withSchema('invasivesbc').returning('code_header_id').insert(
    //     { code_category_id: category_id, code_header_name: 'app_role_code', code_header_title: 'Application Access Role Codes', code_header_description: 'This category holds definition of different user roles of the system along with cross domain code', 
    //         valid_from: knex.fn.now(), created_by_user_id: 1, updated_by_user_id: 1}
    // ))[0];

    return category_id;
}

async function _load_headers(knex: Knex, category_id: number): Promise<Map<string,number>> {

  let file = __dirname + '/data/invasives/business_codes.csv';

  let header_name_map = new Map<string,number>();

  let headerRows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(file)  
    .pipe(parse({
      columns: true
    }))        
    .on('data', (dataRow) => {
      let header_id = 0;

      if (!header_name_map.has(dataRow.code_header_name)) {
        // record the new header name
        header_name_map.set(dataRow.code_header_name,header_id);

        // construct the header row and add it to the header rows array
        let extendedRow = {code_category_id: category_id, code_header_name: dataRow.code_header_name, code_header_title: dataRow.code_header_name, 
          code_header_description: dataRow.code_header_name, valid_from: knex.fn.now(), created_by_user_id: 1, updated_by_user_id: 1}
        headerRows.push(extendedRow);
      }
    })          
    .on('error', (error) => reject(error))
    .on('end', () => { 
      resolve(); 
    });
  });
  
  // insert headers
  let headerResults = (await knex("code_header").withSchema('invasivesbc').returning('*').insert(
      headerRows)) as Object[];

  // update the header name map
  headerResults.forEach(result => {
    header_name_map.set(result["code_header_name"],result["code_header_id"]);
  });

  return header_name_map;
};

async function _load_codes(knex: Knex, header_name_map: Map<string,number>): Promise<void> {

  const file = __dirname + '/data/invasives/business_codes.csv';

  let results = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(file)  
    .pipe(parse({
      columns: true
    }))        
    .on('data', (dataRow) => {
      const extendedRow = {code_header_id: header_name_map.get(dataRow.code_header_name), code_name: dataRow.code_name, code_description: dataRow.code_description, code_sort_order: 0, valid_from: knex.fn.now(), created_by_user_id: 1, updated_by_user_id: 1}
      results.push(extendedRow);
    })          
    .on('error', (error) => reject(error))
    .on('end', () => { 
      resolve(); 
    });   
  });

  // Insert code entries
  await knex("code").withSchema('invasivesbc').insert(results);

  // detect duplicate codes
  // let codeMap = new Map<string,object>();
  // console.log("codeRows:");
  // results.forEach(row => {
  //   let key = row["code_header_id"] + row["code_name"];
  //   if (!codeMap.has(key)) {
  //     // new code
  //     codeMap.set(key,row);
  //   } else {
  //     // existing code
  //     console.log("existing code found.  new row: ", row);
  //     console.log("original row: ", codeMap.get(key));
  //   }
  // });
};