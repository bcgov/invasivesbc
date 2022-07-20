import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  const sql = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;
  alter table application_user ADD CONSTRAINT unique_idir_userid UNIQUE (idir_userid);
  alter table application_user ADD CONSTRAINT unique_bceid_userid UNIQUE (bceid_userid);

 
  `;

  await knex.raw(sql);
}

/**
 * Drop the `application_user` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    alter table application_user drop CONSTRAINT unique_idir_userid ;
    alter table application_user drop CONSTRAINT unique_bceid_userid;

  `);
}
