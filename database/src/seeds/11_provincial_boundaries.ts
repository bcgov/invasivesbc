import { Knex } from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function seed(knex: Knex): Promise<void> {
  try {
    const url = 'https://nrs.objectstore.gov.bc.ca/seeds/provincial_boundary.sql.gz';
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const sql = await ungzip(data);

    // Clear the table
    const clear = 'truncate table invasivesbc.provincial_boundary;';
    await knex.raw(clear);

    await knex.raw(sql.toString());
  } catch (e) {
    console.error('failed to build sql for seed 11', e);
  }
}
