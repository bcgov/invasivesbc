import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    alter table batch_uploads add primary key(id);

    -- fk on activity for the creating batch
    alter table activity_incoming_data add column batch_id int4 null references batch_uploads(id)
     on delete set null on update cascade;

    -- no longer tracked
    alter table batch_uploads drop column created_object_details;

    -- now tracked only in validation_messages
    alter table batch_uploads drop column validation_status;

    alter table batch_uploads add column json_representation jsonb null;
    comment on column batch_uploads.json_representation is 'JSON representation of the original CSV';

    -- at some future point it might make sense to put these in the database
    -- the templates themselves are defined in code at the moment
    alter table batch_uploads add column template varchar(255) not null default 'observation_terrestrial_plant';

`);
}

export async function down(knex: Knex): Promise<void> {
  throw new Error('this is a one-way trip');
}
