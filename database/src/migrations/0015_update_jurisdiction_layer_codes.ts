import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Fixing jurisdiction layer codes to match code table
  await knex.raw(`
  	set search_path=invasivesbc,public;

    update public.jurisdiction set code_name='CPR' where jurisdictn='CP Rail';
    update public.jurisdiction set code_name='MOTI' where jurisdictn='Gravel - MOTI';
    update public.jurisdiction set code_name='RAIL' where jurisdictn='Other Rail';
    update public.jurisdiction set code_name='P' where jurisdictn='Private';
    update public.jurisdiction set code_name='MOF' where jurisdictn='Ministry of Forests, Lands, Natural Resource Operations & Rural Development';
    update public.jurisdiction set code_name='IR' where jurisdictn='First Nations Reserves';
    update public.jurisdiction set code_name='MOF' where jurisdictn='Gravel - FLNRO';
    update public.jurisdiction set code_name='MOTI' where jurisdictn='Ministry of Transportation and Infrastructure';
    update public.jurisdiction set code_name='GL' where jurisdictn='Grazing lease';
    update public.jurisdiction set code_name='BCR' where jurisdictn='BC Rail';
    update public.jurisdiction set code_name='MUNI' where jurisdictn='Municipality owned land';
    update public.jurisdiction set code_name='PP' where jurisdictn='Ministry of Environment & Climate Change Strategy';
    update public.jurisdiction set code_name='CNR' where jurisdictn='CN Rail';
    update public.jurisdiction set code_name='HYDR' where jurisdictn='BC Hydro and Power Authority';
    update public.jurisdiction set code_name='MUNI' where jurisdictn='Municipality';
    update public.jurisdiction set code_name='FED' where jurisdictn='Federal';

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

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
