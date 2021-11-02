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
  const lines = sql.toString().split(/\r?\n/);
  let i = 0;
  let lineArr = [];
  for (const line of lines) {
    lineArr.push(line);
    if (i % 100 === 0 || lines.length - 1 - i === 0) {
      await knex.raw(lineArr.join(''));
      lineArr = [];
    }
    i++;
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
}
