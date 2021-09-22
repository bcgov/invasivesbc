import * as Knex from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function seed(knex: Knex): Promise<void> {
  const url = 'https://quartech.s3.ca-central-1.amazonaws.com/regional_invasive_species_organization_areas.sql.gz';
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });

  const stuff = await ungzip(data);
  console.log(stuff.toString());

  // .then((uncompressed) => {
  //   console.log('uncompressed', uncompressed.toString());
  // })
  // .catch((err) => {
  //   console.error('error', err);
  // });

  // const { data } = await axios.get(url, { responseType: 'arraybuffer' });

  // DEBUG: Not working, callback not firing
  // const result = zlib.inflate(data, (stuff, error) => {
  //   console.log('stuff', stuff);
  //   // console.log('error', error);
  // });
  // console.log(result);
  //TODO: try the node-gzip library next
  // const output = await inflate(data);
  // console.log(data.toString());
  // const { data } = await axios.get(url, { responseType: 'arraybuffer', decompress: true });
  // console.log(data.toString());
}
