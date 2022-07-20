import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  const sql = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;

  alter table application_user drop CONSTRAINT if exists unique_idir_userid;
  alter table application_user drop CONSTRAINT if exists unique_bceid_userid;

  create unique index if not exists unique_idir_userid_if_not_null on application_user (idir_userid) where idir_userid is not null;
  create unique index if not exists unique_bceid_userid_if_not_null on application_user (bceid_userid) where bceid_userid is not null;
  `;

  await knex.raw(sql);
}

/**
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    drop index if exists unique_idir_userid_if_not_null;
    drop index if exists unique_bceid_userid_if_not_null;

    alter table application_user ADD CONSTRAINT unique_idir_userid UNIQUE (idir_userid);
    alter table application_user ADD CONSTRAINT unique_bceid_userid UNIQUE (bceid_userid);
  `);
}
