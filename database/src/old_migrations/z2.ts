import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  const sql = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;
  alter table invasivesbc.access_request ADD UNIQUE (idir_userid, bceid_userid);
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

    alter table access_request drop unique (idir_user_id, bceid_userid) ;
  `);
}
