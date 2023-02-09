import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
  set search_path=invasivesbc,public;

  ALTER TABLE access_request ALTER COLUMN pac_number TYPE int4 using pac_number::int4;
  ALTER TABLE application_user ALTER COLUMN pac_number TYPE int4 using pac_number::int4;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    ALTER TABLE access_request ALTER COLUMN pac_number TYPE varchar(100) using pac_number::varchar;
    ALTER TABLE application_user ALTER COLUMN pac_number TYPE varchar(100) using pac_number::varchar;
    
    `);
}
