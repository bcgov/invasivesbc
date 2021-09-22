import * as Knex from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function seed(knex: Knex): Promise<void> {
  const url = 'https://quartech.s3.ca-central-1.amazonaws.com/regional_invasive_species_organization_areas.sql.gz';
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });
  const sql = await ungzip(data);

  await knex.raw('drop table if exists regional_invasive_species_organization_areas');
  // await knex.raw(sql.toString());
}
