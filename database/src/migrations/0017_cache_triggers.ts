import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  	set search_path=invasivesbc,public;

  	create table cache_versions (
  	  id serial not null primary key,
  	  cache_name varchar(255) not null unique,
  	  updated_at timestamp without time zone not null default current_timestamp
    );

    comment on table cache_versions is 'updated by triggers or external actions to track the last modification time of
     various tables, for use in validating both client-side and server-side caches';

    CREATE OR REPLACE FUNCTION update_cache_version() RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO cache_versions(cache_name, updated_at) values (TG_ARGV[0], current_timestamp)
         on conflict (cache_name) do update set updated_at = current_timestamp;

         RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;


    -- updates to EITHER activity_current or activity_incoming_data should invalidate the cache for activity
    create trigger update_activity_cache_version AFTER UPDATE OR INSERT OR DELETE on activity_current
      EXECUTE procedure update_cache_version('activity');

    -- updates to EITHER activity_current or activity_incoming_data should invalidate the cache for activity
    create trigger update_activity_cache_version AFTER UPDATE OR INSERT OR DELETE on activity_incoming_data
      EXECUTE procedure update_cache_version('activity');

    -- updated by trigger
    insert into cache_versions(cache_name) values ('activity');

    -- to be updated by cronjob that refreshes materialized view
    insert into cache_versions(cache_name) values ('iapp_site_summary');
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    drop function update_cache_version cascade;
    drop table cache_versions;
    `);
}
