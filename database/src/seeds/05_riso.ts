import { Knex } from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function seed(knex: Knex): Promise<void> {
  try {
    const url = 'https://nrs.objectstore.gov.bc.ca/seeds/regional_invasive_species_organization_areas.sql.gz';
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const sql = await ungzip(data);

    // Clear the table
    const clear = 'truncate table public.regional_invasive_species_organization_areas;';
    await knex.raw(clear);

    await knex.raw(sql.toString());
  } catch (e) {
    console.log('failed to build sql', e);
  }
}
