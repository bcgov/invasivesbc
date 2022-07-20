import { Knex } from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function seed(knex: Knex): Promise<void> {
  try {
    /**
     * If we are in development use the light dataset for
     * speeding up the development life cycle.
     */
    const env: string = process.env.REACT_APP_REAL_NODE_ENV;
    let url: string;
    if (env.match(/dev/i) || env.match(/local/i)) {
      url = 'https://nrs.objectstore.gov.bc.ca/seeds/jurisdiction_vancouver_island.sql.gz';
    } else {
      url = 'https://nrs.objectstore.gov.bc.ca/seeds/jurisdiction.sql.gz';
    }

    // Fetch data
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });

    // Unzip to text
    const sql: string = await ungzip(data);

    // Clear the table
    const clear = 'truncate table public.jurisdiction;';
    await knex.raw(clear);

    /**
     * This file is too big to run all at once.
     * Split up by lines.
     */

    const lines = sql.toString().split(/\r?\n/);
    for (const line of lines) {
      await knex.raw(line);
    }

    await knex.raw(`      
      update public.jurisdiction set code_name='CPR' where jurisdictn='CP Rail';
      update public.jurisdiction set code_name='GRVM' where jurisdictn='Gravel - MOTI';
      update public.jurisdiction set code_name='RAIL' where jurisdictn='Other Rail';
      update public.jurisdiction set code_name='P' where jurisdictn='Private';
      update public.jurisdiction set code_name='MOF' where jurisdictn='Ministry of Forests, Lands, Natural Resource Operations & Rural Development';
      update public.jurisdiction set code_name='IR' where jurisdictn='First Nations Reserves';
      update public.jurisdiction set code_name='GRVF' where jurisdictn='Gravel - FLNRO';
      update public.jurisdiction set code_name='MOT' where jurisdictn='Ministry of Transportation and Infrastructure';
      update public.jurisdiction set code_name='GL' where jurisdictn='Grazing lease';
      update public.jurisdiction set code_name='BCR' where jurisdictn='BC Rail';
      update public.jurisdiction set code_name='MOP' where jurisdictn='Municipality owned land';
      update public.jurisdiction set code_name='MW' where jurisdictn='Ministry of Environment & Climate Change Strategy';
      update public.jurisdiction set code_name='CNR' where jurisdictn='CN Rail';
      update public.jurisdiction set code_name='HYDR' where jurisdictn='BC Hydro and Power Authority';
      update public.jurisdiction set code_name='MOP' where jurisdictn='Municipality';
      update public.jurisdiction set code_name='FED' where jurisdictn='Federal';
        `);
  } catch (e) {
    console.log('failed to build sql', e);
  }
}
