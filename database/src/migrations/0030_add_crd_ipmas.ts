import { Knex } from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function up(knex: Knex): Promise<void> {
  try {
    const url = 'https://nrs.objectstore.gov.bc.ca/seeds/CRD_IPMAS.sql.gz';
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const sql = await ungzip(data);

    await knex.raw(sql.toString());
  } catch (e) {
    console.error('Failed to insert IPMAS data:', e);
    throw e;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.raw(`
      DELETE FROM public.invasive_plant_management_areas
      WHERE agency_cd = 'CRD';
    `);
  } catch (e) {
    console.error('Failed to rollback IPMAS data:', e);
    throw e;
  }
}
