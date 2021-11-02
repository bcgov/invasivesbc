import * as Knex from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function seed(knex: Knex): Promise<void> {
  const url = 'https://nrs.objectstore.gov.bc.ca/seeds/jurisdiction.sql.gz';
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });
  const sql = await ungzip(data);

  /**
   * This file is too big to run all at once.
   * Split up by lines, join in groups then run separately
   */
  // const chunk = 10; // Run 100 transactions at a time

  // let cluster: Array<String>;
  // for (let i = 0, j = lines.length; i < j; i += chunk) {
  //   cluster = lines.slice(i, i + chunk); // Array of commands
  //   await knex.raw(cluster.join(' ')); // Execute
  // }

  const lines = sql.toString().split(/\r?\n/);
  for (const line of lines) {
    await knex.raw(line);
  }
}
