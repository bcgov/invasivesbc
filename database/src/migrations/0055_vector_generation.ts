import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = invasivesbc, public;

    create type vector_generation_domains as enum ('ACTIVITIES', 'IAPP', 'POI');
    create type vector_generation_status as enum ('NEW', 'PROCESSING', 'READY', 'ERROR');

    create table vector_generation_request (
        vector_generation_request_id serial primary key,
        data_version varchar(255) not null, -- used a cache key. should be the last modification time of the relevant data.
        domain vector_generation_domains not null default 'ACTIVITIES',
        principal VARCHAR(255) not null, -- username or public for unauthenticated
        query TEXT not null, -- what filters generated this map
        created timestamp without time zone not null default current_timestamp,
        delete_after timestamp without time zone not null default current_timestamp + interval '36 hours', -- when is it safe to delete (a scheduled task will have to actually do the deletion)
        status vector_generation_status not null default 'NEW', -- starts as new until the processor has acted on it
        object_key VARCHAR(512) null -- the id in the s3 bucket of the created pmtiles layer, to be shared with the client via the presigned url mechanism
    );

    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path = invasivesbc,public;

  drop table vector_generation_request;
  drop type vector_generation_domains;
  drop type vector_generation_status;

  `);
}
