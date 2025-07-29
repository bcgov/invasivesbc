import { Knex } from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function up(knex: Knex): Promise<void> {
  try {
    const url = 'https://nrs.objectstore.gov.bc.ca/seeds/NTS_Grids.sql.gz';
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const sql = await ungzip(data);

    await knex.raw(sql.toString());
  } catch (e) {
    console.error('Failed to create NTS grids:', e);
    throw e;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.raw(`
      drop table if exists public.nts_50k_grid;
      drop table if exists public.nts_250k_grid;
    `);
  } catch (e) {
    console.error('Failed to rollback IPMAS data:', e);
    throw e;
  }
}
