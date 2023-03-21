import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    alter table batch_uploads drop column created_by;
    alter table batch_uploads add column created_by integer null references application_user on delete cascade on update cascade;

    -- can start without an upload
    alter table batch_uploads alter column csv_data drop not null;

`);
}

export async function down(knex: Knex): Promise<void> {
  throw new Error('this is a one-way trip');
}
