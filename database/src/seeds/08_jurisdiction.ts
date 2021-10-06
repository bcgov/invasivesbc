import * as Knex from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function seed(knex: Knex): Promise<void> {
  const url = 'https://nrs.objectstore.gov.bc.ca/seeds/jurisdiction.sql.gz';
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });
  const sql = await ungzip(data);

  await knex.raw('drop table if exists jurisdiction');

  /**
   * This file is too big to run all at once.
   * Split up by lines and run separately
   */
  const lines = sql.toString().split(/\r?\n/);

  for (const line of lines) {
    await knex.raw(line);
  }
}
