import * as Knex from 'knex';
import axios from 'axios';
import zlib from 'zlib';
import util from 'util';

const inflate = util.promisify(zlib.inflate);

export async function seed(knex: Knex): Promise<void> {
  const url = 'https://quartech.s3.ca-central-1.amazonaws.com/regional_invasive_species_organization_areas.sql.gz';
  // const { data } = await axios.get(url, { responseType: 'arraybuffer' });
  const { data } = await axios.get(url);

  // DEBUG: Not working, callback not firing
  const result = zlib.inflate(data, (stuff, error) => {
    console.log('stuff', stuff);
    // console.log('error', error);
  });
  console.log(result);
  //TODO: try the node-gzip library next
  // const output = await inflate(data);
  // console.log(data.toString());
  // const { data } = await axios.get(url, { responseType: 'arraybuffer', decompress: true });
  // console.log(data.toString());
}
