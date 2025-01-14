import { Knex } from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function up(knex: Knex): Promise<void> {
  try {
    const url = 'https://nrs.objectstore.gov.bc.ca/seeds/NRRM.sql.gz';
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const sql = await ungzip(data);

    await knex.raw(sql.toString());
  } catch (e) {
    console.error('Failed to insert NRRM data:', e);
    throw e;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.raw(`
      DELETE FROM public.regional_districts
      WHERE agency_cd = 'NRRM';
    `);
  } catch (e) {
    console.error('Failed to rollback NRRM data:', e);
    throw e;
  }
}
