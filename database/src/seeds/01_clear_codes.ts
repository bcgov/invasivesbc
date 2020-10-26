import * as Knex from "knex";
//import csv from "csv-parse";
import parse from "csv-parse";
import { fileURLToPath } from "url";
const fs = require('fs');

const results = [];

export async function seed(knex: Knex): Promise<void> {
  await knex("code").withSchema('invasivesbc').del();
  await knex("code_header").withSchema('invasivesbc').del();
  await knex("code_category").withSchema('invasivesbc').del();

  await knex.raw('alter sequence invasivesbc.code_code_id_seq restart with 1');
  await knex.raw('alter sequence invasivesbc.code_header_code_header_id_seq restart with 1');
  await knex.raw('alter sequence invasivesbc.code_category_code_category_id_seq restart with 1');
};
