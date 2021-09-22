import * as Knex from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function seed(knex: Knex): Promise<void> {
  const url = 'https://quartech.s3.ca-central-1.amazonaws.com/regional_invasive_species_organization_areas.sql.gz';
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });

  const stuff = await ungzip(data);
  console.log(stuff.toString());
}
